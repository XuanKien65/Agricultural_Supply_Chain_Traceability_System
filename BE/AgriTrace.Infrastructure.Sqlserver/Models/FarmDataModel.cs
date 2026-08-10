using System;
using System.Collections.Generic;

namespace AgriTrace.Infrastructure.Sqlserver.Models
{
    /// <summary>
    /// Data Model ánh xạ tới bảng "Farms" trong SQL Server.
    /// Tách biệt hoàn toàn với Domain Entity để cách ly Database khỏi nghiệp vụ.
    /// </summary>
    public class FarmDataModel
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public string Location { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Navigation property: phía "1" giữ danh sách các bản ghi phía "N".
        public ICollection<CropDataModel> Crops { get; set; } = new List<CropDataModel>();
    }
}
