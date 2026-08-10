using System;
using System.Collections.Generic;

namespace AgriTrace.Application.Contracts
{
    // DTO cho một Farm (phía "1"), kèm danh sách Crop lồng bên trong.
    public class FarmDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public string Location { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        public List<CropDto> Crops { get; set; } = new();
    }
}
