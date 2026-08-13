using AgriTrace.Infrastructure.Sqlserver.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgriTrace.Infrastructure.Sqlserver.Configurations;
public sealed class SupplyChainEventConfiguration : IEntityTypeConfiguration<SupplyChainEventDataModel>
{
    public void Configure(EntityTypeBuilder<SupplyChainEventDataModel> b)
    {
        b.ToTable("SupplyChainEvents"); b.HasKey(x => x.Id);
        b.Property(x => x.EventType).HasMaxLength(50).IsRequired(); b.Property(x => x.Location).HasMaxLength(255);
        b.Property(x => x.Hash).HasMaxLength(255).IsRequired(); b.Property(x => x.PreviousHash).HasMaxLength(255);
        b.HasIndex(x => new { x.BatchId, x.EventTime });
    }
}
