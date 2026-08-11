using System;
using System.ComponentModel.DataAnnotations;

namespace AgriTrace.API.Models
{
    // Dữ liệu Client gửi lên để tạo một mùa vụ mới (kèm nông trại mà nó thuộc về).
    public class CropRequest
    {
        [Required]
        public Guid FarmId { get; set; }

        [Required]
        [StringLength(150)]
        public string Name { get; set; } = null!;

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Area must be greater than zero.")]
        public decimal AreaHectares { get; set; }
    }
}
