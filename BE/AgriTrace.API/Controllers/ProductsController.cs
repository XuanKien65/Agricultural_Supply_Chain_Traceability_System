using AgriTrace.API.Models;
using AgriTrace.Application.Features.Products;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgriTrace.API.Controllers;

[ApiController]
[Route("api/v1/products")]
[Authorize]
public sealed class ProductsController(ISender sender) : ControllerBase
{
    /// <summary>
    /// GET /products - Danh sách sản phẩm.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetProducts(
        [FromQuery] int? organizationId,
        [FromQuery] string? category,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        var result = await sender.Send(new GetProductsQuery(organizationId, category, search, page, pageSize), ct);
        return Ok(ApiResponse.Ok(result));
    }

    /// <summary>
    /// GET /products/{productId} - Chi tiết sản phẩm.
    /// </summary>
    [HttpGet("{productId:int}")]
    public async Task<IActionResult> GetProductById(int productId, CancellationToken ct) =>
        Ok(ApiResponse.Ok(await sender.Send(new GetProductByIdQuery(productId), ct)));

    /// <summary>
    /// POST /products - Tạo sản phẩm mới.
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "ADMIN,ORGADMIN")]
    public async Task<IActionResult> CreateProduct([FromBody] CreateProductCommand command, CancellationToken ct)
    {
        var result = await sender.Send(command, ct);
        return CreatedAtAction(nameof(GetProductById), new { productId = result.ProductId }, ApiResponse.Created(result, "Tạo sản phẩm thành công"));
    }

    /// <summary>
    /// PUT /products/{productId} - Cập nhật sản phẩm.
    /// </summary>
    [HttpPut("{productId:int}")]
    [Authorize(Roles = "ADMIN,ORGADMIN")]
    public async Task<IActionResult> UpdateProduct(int productId, [FromBody] UpdateProductRequest request, CancellationToken ct) =>
        Ok(ApiResponse.Ok(await sender.Send(new UpdateProductCommand(productId, request.Name, request.Category, request.Unit), ct), "Cập nhật sản phẩm thành công"));
}

public record UpdateProductRequest(string Name, string? Category, string? Unit);
