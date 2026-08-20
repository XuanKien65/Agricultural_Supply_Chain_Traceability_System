using AgriTrace.Infrastructure.Sqlserver.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgriTrace.Infrastructure.Sqlserver.Configurations;

public sealed class SupplyChainEventConfiguration : IEntityTypeConfiguration<SupplyChainEventDataModel>
{
    public void Configure(EntityTypeBuilder<SupplyChainEventDataModel> builder)
    {
        builder.ToTable("SupplyChainEvents");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.EventType).IsRequired().HasMaxLength(50);
        builder.Property(e => e.Location).HasMaxLength(200);
        builder.Property(e => e.PreviousHash).HasMaxLength(500);
        builder.Property(e => e.CurrentHash).HasMaxLength(500);
        builder.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");

        builder.HasOne(e => e.Batch)
            .WithMany(b => b.Events)
            .HasForeignKey(e => e.BatchId);

        builder.HasOne(e => e.Organization)
            .WithMany()
            .HasForeignKey(e => e.OrganizationId);

        builder.HasOne(e => e.User)
            .WithMany()
            .HasForeignKey(e => e.UserId);
    }
}
