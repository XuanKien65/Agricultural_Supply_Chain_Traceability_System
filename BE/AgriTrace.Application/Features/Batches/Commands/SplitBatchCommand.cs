using AgriTrace.Application.Common.Exceptions;
using AgriTrace.Domain.Entities;
using AgriTrace.Domain.Interfaces;
using MediatR;

namespace AgriTrace.Application.Features.Batches.Commands;

public record SplitChildRequest(decimal Quantity);

public record SplitBatchCommand(int ParentBatchId, int OrganizationId, int PerformedByUserId,
    IReadOnlyList<SplitChildRequest> ChildBatches, string? Location, DateTime? EventTime) : IRequest<SplitResult>;

public record SplitChildResult(int BatchId, string BatchCode, decimal Quantity);

public record SplitResult(int ParentBatchId, int SplitEventId, IReadOnlyList<SplitChildResult> ChildBatches);

public sealed class SplitBatchCommandHandler(IBatchRepository batches, IUserRepository users)
    : IRequestHandler<SplitBatchCommand, SplitResult>
{
    public async Task<SplitResult> Handle(SplitBatchCommand request, CancellationToken ct)
    {
        var parent = await batches.GetByIdAsync(request.ParentBatchId, ct)
            ?? throw new NotFoundException("Không tìm thấy lô hàng cha.");

        var user = await users.GetByIdAsync(request.PerformedByUserId, ct);
        if (user is null || user.OrganizationId != request.OrganizationId)
            throw new ForbiddenException("Người thực hiện không thuộc đơn vị thực hiện.");

        var total = request.ChildBatches.Sum(x => x.Quantity);
        if (total > parent.Quantity)
            throw new InvalidOperationException("Tổng số lượng lô con vượt quá số lượng lô cha.");

        var results = new List<SplitChildResult>();
        foreach (var child in request.ChildBatches)
        {
            var now = DateTime.UtcNow;
            var batchCode = $"BTH-{now:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}";
            var newBatch = new Batch(0, parent.ProductId, batchCode, child.Quantity, parent.CurrentOrganizationId,
                parent.Id, parent.RootBatchId ?? parent.Id, null, now);

            var saved = await batches.AddAsync(newBatch, ct);
            results.Add(new SplitChildResult(saved.Id, saved.BatchCode, saved.Quantity));

            await batches.CreateBatchRelationAsync(parent.Id, saved.Id, "SPLIT", child.Quantity, ct);
        }

        // Append SPLIT event on parent
        var lastEvent = parent.Events.OrderBy(e => e.CreatedAt).LastOrDefault();
        var prevHash = lastEvent?.CurrentHash;
        var eventTime = request.EventTime ?? DateTime.UtcNow;

        // Build canonical event data and compute SHA-256
        var canonical = $"{parent.Id}|SPLIT|{request.OrganizationId}|{request.PerformedByUserId}|{eventTime:O}|{Newtonsoft.Json.JsonConvert.SerializeObject(request.ChildBatches)}|{request.Location}";
        var currentHash = Convert.ToHexString(System.Security.Cryptography.SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(canonical)));

        var ev = new SupplyChainEvent(0, parent.Id, "SPLIT", request.OrganizationId, request.PerformedByUserId,
            Newtonsoft.Json.JsonConvert.SerializeObject(request.ChildBatches), request.Location, prevHash, currentHash, eventTime);

        var savedEvent = await batches.AppendEventAsync(parent, ev, ct);

        return new SplitResult(parent.Id, savedEvent.Id, results);
    }
}
