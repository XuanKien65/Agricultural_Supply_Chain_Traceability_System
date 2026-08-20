using AgriTrace.Domain.Common;
using AgriTrace.Domain.Entities;
using AgriTrace.Domain.Interfaces;
using AgriTrace.Infrastructure.Sqlserver.Models;
using AgriTrace.Infrastructure.Sqlserver.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AgriTrace.Infrastructure.Sqlserver.Repositories;

public sealed class ProductRepository(ApplicationDbContext db) : IProductRepository
{
    public async Task<Product?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var row = await db.Products
            .AsNoTracking()
            .Include(p => p.Organization)
            .FirstOrDefaultAsync(p => p.Id == id, ct);

        return row is null ? null : MapToDomain(row);
    }

    public async Task<PagedResult<Product>> GetAllPagedAsync(
        int? organizationId, string? category, string? search, int page, int pageSize, CancellationToken ct = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = db.Products
            .AsNoTracking()
            .Include(p => p.Organization)
            .AsQueryable();

        if (organizationId.HasValue)
            query = query.Where(p => p.OrganizationId == organizationId.Value);

        if (!string.IsNullOrWhiteSpace(category))
            query = query.Where(p => p.Category != null && p.Category.ToLower() == category.Trim().ToLower());

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(p => p.Name != null && p.Name.ToLower().Contains(term));
        }

        var total = await query.CountAsync(ct);
        var rows = await query
            .OrderByDescending(p => p.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return new PagedResult<Product>(rows.Select(MapToDomain).ToList(), total);
    }

    public async Task<Product> AddAsync(Product product, CancellationToken ct = default)
    {
        var row = new ProductDataModel
        {
            Name = product.Name,
            Category = product.Category,
            Unit = product.Unit,
            OrganizationId = product.OrganizationId
        };

        db.Products.Add(row);
        await db.SaveChangesAsync(ct);

        return (await GetByIdAsync(row.Id, ct))!;
    }

    public async Task<Product> UpdateAsync(Product product, CancellationToken ct = default)
    {
        var row = await db.Products.FindAsync([product.Id], ct)
            ?? throw new InvalidOperationException("Không tìm thấy sản phẩm.");

        row.Name = product.Name;
        row.Category = product.Category;
        row.Unit = product.Unit;

        await db.SaveChangesAsync(ct);
        return (await GetByIdAsync(row.Id, ct))!;
    }

    private static Product MapToDomain(ProductDataModel x) => new(
        x.Id,
        x.Name ?? string.Empty,
        x.Category,
        x.Unit,
        x.OrganizationId,
        x.Organization?.Name);
}
