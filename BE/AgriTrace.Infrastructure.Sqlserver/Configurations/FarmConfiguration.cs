using AgriTrace.Infrastructure.Sqlserver.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgriTrace.Infrastructure.Sqlserver.Configurations
{
    public class FarmConfiguration : IEntityTypeConfiguration<FarmDataModel>
    {
        public void Configure(EntityTypeBuilder<FarmDataModel> builder)
        {
            builder.ToTable("Farms");

            builder.HasKey(f => f.Id);

            builder.Property(f => f.Name)
                .IsRequired()
                .HasMaxLength(150);

            builder.Property(f => f.Location)
                .IsRequired()
                .HasMaxLength(250);

            builder.Property(f => f.CreatedAt)
                .IsRequired();

            // Cấu hình quan hệ 1 - N: một Farm có nhiều Crop.
            builder.HasMany(f => f.Crops)
                .WithOne(c => c.Farm)
                .HasForeignKey(c => c.FarmId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
