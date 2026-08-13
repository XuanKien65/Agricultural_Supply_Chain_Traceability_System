using AgriTrace.Application.Contracts;
using AgriTrace.Domain.Interfaces;
using MediatR;

namespace AgriTrace.Application.Features.Products.Queries;

public record GetProductsQuery : IRequest<IReadOnlyList<ProductDto>>;
public sealed class GetProductsQueryHandler(IProductRepository repository) : IRequestHandler<GetProductsQuery, IReadOnlyList<ProductDto>>
{
    public async Task<IReadOnlyList<ProductDto>> Handle(GetProductsQuery request, CancellationToken cancellationToken) =>
        (await repository.GetAllAsync(cancellationToken)).Select(x => new ProductDto(x.Id, x.Name, x.Unit, x.Description)).ToList();
}
