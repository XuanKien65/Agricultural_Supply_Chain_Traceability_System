using AgriTrace.Application.Contracts;
using AgriTrace.Domain.Interfaces;
using MediatR;

namespace AgriTrace.Application.Features.Batches.Queries;

public record GetFarmerDashboardQuery(int OrganizationId) : IRequest<FarmerDashboardDto>;

public sealed class GetFarmerDashboardQueryHandler(IBatchRepository batches, IProductRepository products)
    : IRequestHandler<GetFarmerDashboardQuery, FarmerDashboardDto>
{
    public async Task<FarmerDashboardDto> Handle(GetFarmerDashboardQuery request, CancellationToken cancellationToken)
    {
        var page = await batches.GetFarmerBatchesAsync(request.OrganizationId, null, null, 1, 100, cancellationToken);
        var productPage = await products.GetAllPagedAsync(request.OrganizationId, null, null, 1, 100, cancellationToken);
        var catalog = productPage.Items.ToDictionary(x => x.Id);

        var total = page.TotalCount;
        var inProgress = page.Items.Count;
        var completed = 0;
        var weight = page.Items.Sum(x => x.Quantity);
        var items = page.Items.Take(5)
            .Select(x =>
            {
                var prod = catalog.TryGetValue(x.ProductId, out var p) ? p : new Domain.Entities.Product(x.ProductId, "Sản phẩm nông sản", null, "kg", x.CurrentOrganizationId ?? 0);
                return FarmerBatchMapper.ToDto(x, prod);
            })
            .ToList();

        return new(total, inProgress, completed, weight, items);
    }
}
