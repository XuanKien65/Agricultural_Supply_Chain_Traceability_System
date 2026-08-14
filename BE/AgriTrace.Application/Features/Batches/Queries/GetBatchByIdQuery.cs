using AgriTrace.Application.Contracts;
using AgriTrace.Application.Common.Exceptions;
using AgriTrace.Domain.Interfaces;
using MediatR;

namespace AgriTrace.Application.Features.Batches.Queries;

public record GetBatchByIdQuery(int BatchId) : IRequest<FarmerBatchDto>;
public sealed class GetBatchByIdQueryHandler(IBatchRepository batches, IProductRepository products)
    : IRequestHandler<GetBatchByIdQuery, FarmerBatchDto>
{
    public async Task<FarmerBatchDto> Handle(GetBatchByIdQuery request, CancellationToken cancellationToken)
    {
        var batch = await batches.GetByIdAsync(request.BatchId, cancellationToken) ?? throw new NotFoundException("Không tìm thấy lô hàng.");
        var product = await products.GetByIdAsync(batch.ProductId, cancellationToken) ?? throw new NotFoundException("Không tìm thấy sản phẩm.");
        return FarmerBatchMapper.ToDto(batch, product);
    }
}
