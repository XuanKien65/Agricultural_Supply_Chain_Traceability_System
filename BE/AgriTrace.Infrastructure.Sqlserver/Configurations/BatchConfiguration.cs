using AgriTrace.Infrastructure.Sqlserver.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgriTrace.Infrastructure.Sqlserver.Configurations;
public sealed class BatchConfiguration : IEntityTypeConfiguration<BatchDataModel>
{
    public void Configure(EntityTypeBuilder<BatchDataModel> b)
    {
        b.ToTable("Batches"); b.HasKey(x => x.Id);
        b.Property(x => x.QrCode).HasMaxLength(255).IsRequired(); b.HasIndex(x => x.QrCode).IsUnique();
        b.Property(x => x.Weight).HasPrecision(18, 2); b.Property(x => x.Status).HasMaxLength(50).IsRequired();
        b.HasOne(x => x.Product).WithMany().HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Restrict);
        b.HasMany(x => x.Events).WithOne(x => x.Batch).HasForeignKey(x => x.BatchId).OnDelete(DeleteBehavior.Restrict);
    }
}
