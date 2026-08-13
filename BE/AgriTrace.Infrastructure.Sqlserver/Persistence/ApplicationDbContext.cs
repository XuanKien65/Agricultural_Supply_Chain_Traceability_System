using AgriTrace.Infrastructure.Sqlserver.Models;
using Microsoft.EntityFrameworkCore;

namespace AgriTrace.Infrastructure.Sqlserver.Persistence
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<FarmDataModel> Farms => Set<FarmDataModel>();
        public DbSet<CropDataModel> Crops => Set<CropDataModel>();
        public DbSet<ProductDataModel> Products => Set<ProductDataModel>();
        public DbSet<BatchDataModel> Batches => Set<BatchDataModel>();
        public DbSet<SupplyChainEventDataModel> SupplyChainEvents => Set<SupplyChainEventDataModel>();
        public DbSet<UserDataModel> Users => Set<UserDataModel>();
        public DbSet<RoleDataModel> Roles => Set<RoleDataModel>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
        }
    }
}
