using AgriTrace.Application.Contracts;
using AgriTrace.Domain.Entities;
using AgriTrace.Domain.Interfaces;
using MediatR;

namespace AgriTrace.Application.Features.Batches.Commands;

public record CreateFarmerBatchCommand(int ProductId, int ProducerOrganizationId, int PerformedByUserId,
    DateOnly HarvestDate, decimal Weight, string? Location, string? HarvestNotes) : IRequest<CreateFarmerBatchResult>;

public sealed class CreateFarmerBatchCommandHandler(IBatchRepository batches, IProductRepository products)
    : IRequestHandler<CreateFarmerBatchCommand, CreateFarmerBatchResult>
{
    public async Task<CreateFarmerBatchResult> Handle(CreateFarmerBatchCommand request, CancellationToken cancellationToken)
    {
        _ = await products.GetByIdAsync(request.ProductId, cancellationToken)
            ?? throw new InvalidOperationException("Product not found.");
        var now = DateTime.UtcNow;
        var batch = new Batch(0, request.ProductId, request.ProducerOrganizationId, null, "pending",
            request.HarvestDate, request.Weight, "Created", now);
        batch.AddHarvestEvent(request.ProducerOrganizationId, request.PerformedByUserId,
            request.HarvestDate.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc), request.Location, request.HarvestNotes);
        var saved = await batches.AddAsync(batch, cancellationToken);
        return new(saved.Id, $"BTH-{saved.CreatedAt:yyyyMMdd}-{saved.Id:D3}", saved.QrCode);
    }
}
