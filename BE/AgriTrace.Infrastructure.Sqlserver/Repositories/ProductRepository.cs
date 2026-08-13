using AgriTrace.Domain.Entities;
using AgriTrace.Domain.Interfaces;
using AgriTrace.Infrastructure.Sqlserver.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AgriTrace.Infrastructure.Sqlserver.Repositories;
public sealed class ProductRepository(ApplicationDbContext db) : IProductRepository
{
    public async Task<IReadOnlyList<Product>> GetAllAsync(CancellationToken cancellationToken = default) =>
        (await db.Products.AsNoTracking().OrderBy(x => x.Name).ToListAsync(cancellationToken))
        .Select(x => new Product(x.Id, x.Name, x.Unit, x.Description)).ToList();
    public async Task<Product?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var x = await db.Products.AsNoTracking().FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
        return x is null ? null : new Product(x.Id, x.Name, x.Unit, x.Description);
    }
}
