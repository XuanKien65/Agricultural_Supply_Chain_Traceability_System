using AgriTrace.Infrastructure.Sqlserver.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgriTrace.Infrastructure.Sqlserver.Configurations;

public sealed class RoleConfiguration : IEntityTypeConfiguration<RoleDataModel>
{
    public void Configure(EntityTypeBuilder<RoleDataModel> b)
    {
        b.ToTable("Roles");
        b.HasKey(x => x.Id);
        b.Property(x => x.Name).HasMaxLength(50).IsRequired();
        b.Property(x => x.Description).HasMaxLength(255);
    }
}
