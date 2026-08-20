using AgriTrace.Infrastructure.Sqlserver.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgriTrace.Infrastructure.Sqlserver.Configurations;

public sealed class BatchRelationConfiguration : IEntityTypeConfiguration<BatchRelationDataModel>
{
    public void Configure(EntityTypeBuilder<BatchRelationDataModel> builder)
    {
        builder.ToTable("BatchRelations");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.RelationType).HasMaxLength(50);
        builder.Property(x => x.CreatedAt).HasDefaultValueSql("GETDATE()");

        builder.HasOne(x => x.SourceBatch).WithMany().HasForeignKey(x => x.SourceBatchId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(x => x.TargetBatch).WithMany().HasForeignKey(x => x.TargetBatchId).OnDelete(DeleteBehavior.Cascade);
    }
}
