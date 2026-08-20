using AgriTrace.Application.Common.Exceptions;
using AgriTrace.Domain.Common;
using AgriTrace.Domain.Entities;
using AgriTrace.Domain.Interfaces;
using MediatR;

namespace AgriTrace.Application.Features.Products;

public record ProductDto(
    int ProductId,
    int OrganizationId,
    string? OrganizationName,
    string Name,
    string? Category,
    string? Unit);

public record GetProductsQuery(
    int? OrganizationId, string? Category, string? Search, int Page = 1, int PageSize = 20) : IRequest<PagedResult<ProductDto>>;

public record GetProductByIdQuery(int ProductId) : IRequest<ProductDto>;
public record CreateProductCommand(int OrganizationId, string Name, string? Category, string? Unit) : IRequest<ProductDto>;
public record UpdateProductCommand(int ProductId, string Name, string? Category, string? Unit) : IRequest<ProductDto>;

public sealed class ProductQueryCommandHandler(IProductRepository repo)
    : IRequestHandler<GetProductsQuery, PagedResult<ProductDto>>,
      IRequestHandler<GetProductByIdQuery, ProductDto>,
      IRequestHandler<CreateProductCommand, ProductDto>,
      IRequestHandler<UpdateProductCommand, ProductDto>
{
    public async Task<PagedResult<ProductDto>> Handle(GetProductsQuery request, CancellationToken ct)
    {
        var result = await repo.GetAllPagedAsync(request.OrganizationId, request.Category, request.Search, request.Page, request.PageSize, ct);
        var dtos = result.Items.Select(ToDto).ToList();
        return new PagedResult<ProductDto>(dtos, result.TotalCount);
    }

    public async Task<ProductDto> Handle(GetProductByIdQuery request, CancellationToken ct)
    {
        var p = await repo.GetByIdAsync(request.ProductId, ct)
            ?? throw new NotFoundException($"Không tìm thấy sản phẩm #{request.ProductId}.");

        return ToDto(p);
    }

    public async Task<ProductDto> Handle(CreateProductCommand request, CancellationToken ct)
    {
        var product = new Product(0, request.Name, request.Category, request.Unit, request.OrganizationId);
        var created = await repo.AddAsync(product, ct);
        return ToDto(created);
    }

    public async Task<ProductDto> Handle(UpdateProductCommand request, CancellationToken ct)
    {
        var p = await repo.GetByIdAsync(request.ProductId, ct)
            ?? throw new NotFoundException($"Không tìm thấy sản phẩm #{request.ProductId}.");

        p.Update(request.Name, request.Category, request.Unit);
        var updated = await repo.UpdateAsync(p, ct);
        return ToDto(updated);
    }

    private static ProductDto ToDto(Product x) => new(
        x.Id,
        x.OrganizationId,
        x.OrganizationName,
        x.Name,
        x.Category,
        x.Unit);
}
