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
        var productPage = await products.GetAllPagedAsync(request.OrganizationId, null, null, 1, 100, cancellationToken);
        var catalog = productPage.Items.ToDictionary(x => x.Id);

        var items = page.Items
            .Select(x =>
            {
                var prod = catalog.TryGetValue(x.ProductId, out var p) ? p : new Domain.Entities.Product(x.ProductId, "Sản phẩm nông sản", null, "kg", x.CurrentOrganizationId ?? 0);
                return FarmerBatchMapper.ToDto(x, prod);
            })
            .ToList();

        return new(items, page.TotalCount, request.Page, request.PageSize);
    }
}
