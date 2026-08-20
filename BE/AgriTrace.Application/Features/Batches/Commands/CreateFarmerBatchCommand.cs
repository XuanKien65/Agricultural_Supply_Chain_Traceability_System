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
            ?? throw new InvalidOperationException("Sản phẩm không tồn tại.");

        var now = DateTime.UtcNow;
        var batchCode = $"BTH-{now:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}";
        var batch = new Batch(0, request.ProductId, batchCode, request.Weight, request.ProducerOrganizationId,
            null, null, null, now);

        var saved = await batches.AddAsync(batch, cancellationToken);
        return new(saved.Id, saved.BatchCode, saved.QrCode ?? $"https://agritrace.vn/trace/{saved.Id}");
    }
}
