using AgriTrace.Application.Contracts;
using AgriTrace.Application.Common.Exceptions;
using AgriTrace.Domain.Interfaces;
using MediatR;

namespace AgriTrace.Application.Features.Batches.Queries;

public record GetFarmerBatchByIdQuery(int BatchId, int OrganizationId) : IRequest<FarmerBatchDto>;
public sealed class GetFarmerBatchByIdQueryHandler(IBatchRepository batches, IProductRepository products)
    : IRequestHandler<GetFarmerBatchByIdQuery, FarmerBatchDto>
{
    public async Task<FarmerBatchDto> Handle(GetFarmerBatchByIdQuery request, CancellationToken cancellationToken)
    {
        var batch = await batches.GetByIdAsync(request.BatchId, cancellationToken);
        if (batch is null || batch.ProducerOrganizationId != request.OrganizationId) throw new NotFoundException("Batch not found.");
        var product = await products.GetByIdAsync(batch.ProductId, cancellationToken) ?? throw new NotFoundException("Product not found.");
        return FarmerBatchMapper.ToDto(batch, product);
    }
}
