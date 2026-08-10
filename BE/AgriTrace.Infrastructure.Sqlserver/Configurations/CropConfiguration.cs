using AgriTrace.Infrastructure.Sqlserver.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgriTrace.Infrastructure.Sqlserver.Configurations
{
    public class CropConfiguration : IEntityTypeConfiguration<CropDataModel>
    {
        public void Configure(EntityTypeBuilder<CropDataModel> builder)
        {
            builder.ToTable("Crops");

            builder.HasKey(c => c.Id);

            builder.Property(c => c.Name)
                .IsRequired()
                .HasMaxLength(150);

            builder.Property(c => c.AreaHectares)
                .IsRequired()
                .HasColumnType("decimal(10,2)");

            builder.Property(c => c.CreatedAt)
                .IsRequired();

            // Khóa ngoại bắt buộc: mỗi Crop luôn thuộc về một Farm.
            builder.Property(c => c.FarmId)
                .IsRequired();
        }
    }
}
