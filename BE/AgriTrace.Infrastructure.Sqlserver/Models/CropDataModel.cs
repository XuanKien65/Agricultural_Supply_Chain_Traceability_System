using System;

namespace AgriTrace.Infrastructure.Sqlserver.Models
{
    /// <summary>
    /// Data Model ánh xạ tới bảng "Crops" trong SQL Server (phía "N").
    /// </summary>
    public class CropDataModel
    {
        public Guid Id { get; set; }

        // Khóa ngoại trỏ về bảng Farms.
        public Guid FarmId { get; set; }

        public string Name { get; set; } = null!;
        public decimal AreaHectares { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Navigation property: phía "N" trỏ ngược về phía "1".
        public FarmDataModel? Farm { get; set; }
    }
}
