using AgriTrace.Infrastructure.Sqlserver.Models;
using Microsoft.EntityFrameworkCore;

namespace AgriTrace.Infrastructure.Sqlserver.Persistence;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<OrganizationDataModel> Organizations => Set<OrganizationDataModel>();
    public DbSet<UserDataModel> Users => Set<UserDataModel>();
    public DbSet<ProductDataModel> Products => Set<ProductDataModel>();
    public DbSet<BatchDataModel> Batches => Set<BatchDataModel>();
    public DbSet<SupplyChainEventDataModel> SupplyChainEvents => Set<SupplyChainEventDataModel>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    }
}
