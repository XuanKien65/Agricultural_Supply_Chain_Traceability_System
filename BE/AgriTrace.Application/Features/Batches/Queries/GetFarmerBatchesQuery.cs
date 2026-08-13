using AgriTrace.Application.Contracts;
using AgriTrace.Domain.Interfaces;
using MediatR;

namespace AgriTrace.Application.Features.Batches.Queries;

public record GetFarmerBatchesQuery(int OrganizationId, string? Search, string? Status, int Page = 1, int PageSize = 20)
    : IRequest<PaginationResponse<FarmerBatchDto>>;
public sealed class GetFarmerBatchesQueryHandler(IBatchRepository batches, IProductRepository products)
    : IRequestHandler<GetFarmerBatchesQuery, PaginationResponse<FarmerBatchDto>>
{
    public async Task<PaginationResponse<FarmerBatchDto>> Handle(GetFarmerBatchesQuery request, CancellationToken cancellationToken)
    {
        var page = await batches.GetFarmerBatchesAsync(request.OrganizationId, request.Search, request.Status, request.Page, request.PageSize, cancellationToken);
        var catalog = (await products.GetAllAsync(cancellationToken)).ToDictionary(x => x.Id);
        var items = page.Items.Where(x => catalog.ContainsKey(x.ProductId)).Select(x => FarmerBatchMapper.ToDto(x, catalog[x.ProductId])).ToList();
        return new(items, page.TotalCount, request.Page, request.PageSize);
    }
}
