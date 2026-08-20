using AgriTrace.Application.Contracts;
using AgriTrace.Domain.Entities;
using AgriTrace.Domain.Interfaces;
using MediatR;
using System.Security.Cryptography;
using System.Text;
using Newtonsoft.Json;

namespace AgriTrace.Application.Features.Batches.Commands;

public record CreateFarmerBatchCommand(int ProductId, int ProducerOrganizationId, int PerformedByUserId,
    DateOnly HarvestDate, decimal Weight, string? Location, string? HarvestNotes) : IRequest<CreateFarmerBatchResult>;

public sealed class CreateFarmerBatchCommandHandler(IBatchRepository batches, IProductRepository products)
    : IRequestHandler<CreateFarmerBatchCommand, CreateFarmerBatchResult>
{
    public async Task<CreateFarmerBatchResult> Handle(CreateFarmerBatchCommand request, CancellationToken cancellationToken)
    {
        _ = await products.GetByIdAsync(request.ProductId, cancellationToken)
            ?? throw new InvalidOperationException("Sản phẩm không tồn tại.");

        var now = DateTime.UtcNow;
        var batchCode = $"BTH-{now:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}";
        var batch = new Batch(0, request.ProductId, batchCode, request.Weight, request.ProducerOrganizationId,
            null, null, null, now);

        var saved = await batches.AddAsync(batch, cancellationToken);

        // Automatically record HARVEST event for this newly created batch
        var eventTime = request.HarvestDate.ToDateTime(TimeOnly.MinValue).ToUniversalTime();
        var eventDataObj = new { field = request.Location, notes = request.HarvestNotes, weight = request.Weight };
        var eventData = JsonConvert.SerializeObject(eventDataObj);

        var canonical = $"{saved.Id}|HARVEST|{request.ProducerOrganizationId}|{request.PerformedByUserId}|{eventTime:O}|{eventData}|{request.Location}";
        var currentHash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(canonical)));

        var harvestEvent = new SupplyChainEvent(0, saved.Id, "HARVEST", request.ProducerOrganizationId, request.PerformedByUserId,
            eventData, request.Location, null, currentHash, eventTime);

        await batches.AppendEventAsync(saved, harvestEvent, cancellationToken);

        return new(saved.Id, saved.BatchCode, saved.QrCode ?? $"https://agritrace.vn/trace/{saved.Id}");
    }
}
