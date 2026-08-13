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
        var result = await batches.GetFarmerBatchesAsync(request.OrganizationId, null, null, 1, 100, cancellationToken);
        var catalog = (await products.GetAllAsync(cancellationToken)).ToDictionary(x => x.Id);
        var items = result.Items.Where(x => catalog.ContainsKey(x.ProductId)).ToList();
        var recent = items.Take(5).Select(x => FarmerBatchMapper.ToDto(x, catalog[x.ProductId])).ToList();
        return new(result.TotalCount, items.Count(x => x.Status == "Created"), items.Count(x => x.Status == "Recalled"),
            items.Sum(x => x.Weight), recent);
    }
}
