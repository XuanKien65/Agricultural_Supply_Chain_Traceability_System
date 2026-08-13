using AgriTrace.Application.Contracts;
using AgriTrace.Domain.Entities;

namespace AgriTrace.Application.Features.Batches;

internal static class FarmerBatchMapper
{
    public static FarmerBatchDto ToDto(Batch batch, Product product) => new(batch.Id, $"BTH-{batch.CreatedAt:yyyyMMdd}-{batch.Id:D3}",
        batch.ProductId, product.Name, product.Unit, batch.ProducerOrganizationId, batch.HarvestDate, batch.Weight,
        batch.Status, batch.QrCode, batch.CreatedAt, batch.Events.Select(e => new BatchEventDto(e.Id, e.EventType,
            e.EventTime, e.Location, e.AdditionalData, e.PreviousHash, e.Hash)).ToList());
}
