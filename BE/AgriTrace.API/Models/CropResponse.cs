using System;

namespace AgriTrace.API.Models
{
    // Dữ liệu trả về Client cho một mùa vụ (phía "N").
    public class CropResponse
    {
        public Guid Id { get; set; }
        public Guid FarmId { get; set; }
        public string Name { get; set; } = null!;
        public decimal AreaHectares { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
