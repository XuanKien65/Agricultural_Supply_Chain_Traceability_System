using AgriTrace.Infrastructure.Sqlserver.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgriTrace.Infrastructure.Sqlserver.Configurations;

public sealed class OrganizationConfiguration : IEntityTypeConfiguration<OrganizationDataModel>
{
    public void Configure(EntityTypeBuilder<OrganizationDataModel> builder)
    {
        builder.ToTable("Organizations");
        builder.HasKey(o => o.Id);

        builder.Property(o => o.Name).IsRequired().HasMaxLength(200);
        builder.Property(o => o.Type).IsRequired().HasMaxLength(50);
        builder.Property(o => o.Status).IsRequired().HasMaxLength(20).HasDefaultValue("ACTIVE");
        builder.Property(o => o.CreatedAt).HasDefaultValueSql("GETDATE()");
    }
}
