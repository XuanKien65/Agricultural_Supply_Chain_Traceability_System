using AgriTrace.Infrastructure.Sqlserver.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgriTrace.Infrastructure.Sqlserver.Configurations;
public sealed class ProductConfiguration : IEntityTypeConfiguration<ProductDataModel>
{
    public void Configure(EntityTypeBuilder<ProductDataModel> b)
    {
        b.ToTable("Products"); b.HasKey(x => x.Id);
        b.Property(x => x.Name).HasMaxLength(200).IsRequired();
        b.Property(x => x.Unit).HasMaxLength(50); b.Property(x => x.Description);
    }
}
