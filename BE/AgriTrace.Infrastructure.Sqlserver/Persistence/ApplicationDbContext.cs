using AgriTrace.Infrastructure.Sqlserver.Models;
using Microsoft.EntityFrameworkCore;

namespace AgriTrace.Infrastructure.Sqlserver.Persistence;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

<<<<<<< Updated upstream
    public DbSet<OrganizationDataModel> Organizations => Set<OrganizationDataModel>();
    public DbSet<UserDataModel> Users => Set<UserDataModel>();
    public DbSet<ProductDataModel> Products => Set<ProductDataModel>();
    public DbSet<BatchDataModel> Batches => Set<BatchDataModel>();
    public DbSet<SupplyChainEventDataModel> SupplyChainEvents => Set<SupplyChainEventDataModel>();
    public DbSet<BatchImageDataModel> BatchImages => Set<BatchImageDataModel>();
    public DbSet<InspectionDataModel> Inspections => Set<InspectionDataModel>();
    public DbSet<CertificateDataModel> Certificates => Set<CertificateDataModel>();
    public DbSet<RecallDataModel> Recalls => Set<RecallDataModel>();
    public DbSet<NotificationDataModel> Notifications => Set<NotificationDataModel>();
    public DbSet<BatchRelationDataModel> BatchRelations => Set<BatchRelationDataModel>();
=======
    public DbSet<OrganizationDataModel> Organizations
        => Set<OrganizationDataModel>();
>>>>>>> Stashed changes

    public DbSet<UserDataModel> Users
        => Set<UserDataModel>();

    public DbSet<ProductDataModel> Products
        => Set<ProductDataModel>();

    public DbSet<BatchDataModel> Batches
        => Set<BatchDataModel>();

    public DbSet<SupplyChainEventDataModel> SupplyChainEvents
        => Set<SupplyChainEventDataModel>();

    public DbSet<BatchImageDataModel> BatchImages
        => Set<BatchImageDataModel>();

    public DbSet<InspectionDataModel> Inspections
        => Set<InspectionDataModel>();

    public DbSet<CertificateDataModel> Certificates
        => Set<CertificateDataModel>();

    public DbSet<RecallDataModel> Recalls
        => Set<RecallDataModel>();

    public DbSet<NotificationDataModel> Notifications
        => Set<NotificationDataModel>();

    public DbSet<BatchRelationDataModel> BatchRelations
        => Set<BatchRelationDataModel>();

    protected override void OnModelCreating(
        ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(
            typeof(ApplicationDbContext).Assembly);
    }
}