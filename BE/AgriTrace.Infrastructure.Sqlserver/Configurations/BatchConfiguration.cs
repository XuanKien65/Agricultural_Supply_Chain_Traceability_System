using AgriTrace.Infrastructure.Sqlserver.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgriTrace.Infrastructure.Sqlserver.Configurations;

public sealed class BatchConfiguration : IEntityTypeConfiguration<BatchDataModel>
{
    public void Configure(EntityTypeBuilder<BatchDataModel> builder)
    {
        builder.ToTable("Batches");
        builder.HasKey(b => b.Id);

        builder.Property(b => b.BatchCode).IsRequired().HasMaxLength(100);
        builder.HasIndex(b => b.BatchCode).IsUnique();
        builder.Property(b => b.Quantity).HasColumnType("decimal(18,2)");
        builder.Property(b => b.QRCode).HasMaxLength(500);
        builder.Property(b => b.CreatedAt).HasDefaultValueSql("GETDATE()");

        builder.HasOne(b => b.Product)
            .WithMany()
            .HasForeignKey(b => b.ProductId);

        builder.HasOne(b => b.CurrentOrganization)
            .WithMany()
            .HasForeignKey(b => b.CurrentOrganizationId);

        builder.HasOne(b => b.ParentBatch)
            .WithMany()
            .HasForeignKey(b => b.ParentBatchId);
    }
}
