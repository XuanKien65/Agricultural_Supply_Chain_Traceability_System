using System;

namespace AgriTrace.Application.Contracts
{
    // DTO phẳng cho một Crop (phía "N").
    public class CropDto
    {
        public Guid Id { get; set; }
        public Guid FarmId { get; set; }
        public string Name { get; set; } = null!;
        public decimal AreaHectares { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
