using AgriTrace.Application.Contracts;
using AgriTrace.Domain.Entities;

namespace AgriTrace.Application.Features.Batches;

internal static class FarmerBatchMapper
{
    public static FarmerBatchDto ToDto(Batch batch, Product product) => new(
        batch.Id,
        batch.BatchCode,
        batch.ProductId,
        product.Name,
        product.Unit,
        batch.CurrentOrganizationId ?? 0,
        null,
        batch.Quantity,
        "ACTIVE",
        batch.QrCode ?? $"https://agritrace.vn/trace/{batch.Id}",
        batch.CreatedAt,
        batch.Events.Select(e => new BatchEventDto(
            e.Id,
            e.EventType,
            e.CreatedAt,
            e.Location,
            e.EventData,
            e.PreviousHash,
            e.CurrentHash ?? string.Empty)).ToList());
}
