using AgriTrace.Application.Common.Exceptions;
using AgriTrace.Domain.Common;
using AgriTrace.Domain.Entities;
using AgriTrace.Domain.Interfaces;
using MediatR;
using System.Text.Json;

namespace AgriTrace.Application.Features.Batches.Commands;

public record MergeSourceRequest(int BatchId, decimal Quantity);

public record MergeBatchesCommand(IReadOnlyList<MergeSourceRequest> Sources, int OrganizationId, int PerformedByUserId,
    string? Location, string? Description, DateTime? EventTime) : IRequest<MergeResult>;

public record MergeResult(int ResultBatchId, string BatchCode, decimal TotalQuantity, int MergeEventId, IReadOnlyList<int> SourceBatchIds);

public sealed class MergeBatchesCommandHandler(IBatchRepository batches, IProductRepository products, IUserRepository users)
    : IRequestHandler<MergeBatchesCommand, MergeResult>
{
    public async Task<MergeResult> Handle(MergeBatchesCommand request, CancellationToken ct)
    {
        if (request.Sources == null || request.Sources.Count == 0)
            throw new InvalidOperationException("Không có lô nguồn để gộp.");

        var first = await batches.GetByIdAsync(request.Sources[0].BatchId, ct)
            ?? throw new NotFoundException("Lô nguồn không tồn tại.");

        var productId = first.ProductId;
        foreach (var src in request.Sources)
        {
            var b = await batches.GetByIdAsync(src.BatchId, ct) ?? throw new NotFoundException($"Lô {src.BatchId} không tồn tại.");
            if (b.ProductId != productId) throw new InvalidOperationException("Các lô nguồn không cùng sản phẩm.");
            if (src.Quantity > b.Quantity) throw new InvalidOperationException($"Số lượng lấy từ lô {src.BatchId} vượt quá lượng hiện có.");
        }

        var total = request.Sources.Sum(x => x.Quantity);
        var now = DateTime.UtcNow;
        var batchCode = $"BTH-{now:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}";

        var newBatch = new Batch(0, productId, batchCode, total, request.OrganizationId, null, null, null, now);
        var saved = await batches.AddAsync(newBatch, ct);

        // create relations
        foreach (var src in request.Sources)
        {
            await batches.CreateBatchRelationAsync(src.BatchId, saved.Id, "MERGE", src.Quantity, ct);
        }

        // append MERGE event to result batch
        var eventTime = request.EventTime ?? now;
        var eventData = JsonSerializer.Serialize(request.Sources);

        var canonical = $"{saved.Id}|MERGE|{request.OrganizationId}|{request.PerformedByUserId}|{HashCanonical.Timestamp(eventTime)}|{eventData}|{request.Location}";
        var currentHash = Convert.ToHexString(System.Security.Cryptography.SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(canonical)));
        
        var ev = new SupplyChainEvent(0, saved.Id, "MERGE", request.OrganizationId, request.PerformedByUserId,
            eventData, request.Location, null, currentHash, eventTime);

        var savedEvent = await batches.AppendEventAsync(saved, ev, ct);

        return new MergeResult(saved.Id, saved.BatchCode, saved.Quantity, savedEvent.Id, request.Sources.Select(s => s.BatchId).ToList());
    }
}
