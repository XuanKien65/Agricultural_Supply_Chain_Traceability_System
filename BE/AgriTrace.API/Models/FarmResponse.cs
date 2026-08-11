using System;
using System.Collections.Generic;

namespace AgriTrace.API.Models
{
    // Dữ liệu trả về Client cho một nông trại (phía "1"), kèm danh sách mùa vụ.
    public class FarmResponse
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public string Location { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        public List<CropResponse> Crops { get; set; } = new();
    }
}
