using System.ComponentModel.DataAnnotations;

namespace AgriTrace.API.Models
{
    // Dữ liệu Client gửi lên để tạo một nông trại mới.
    public class FarmRequest
    {
        [Required]
        [StringLength(150)]
        public string Name { get; set; } = null!;

        [Required]
        [StringLength(250)]
        public string Location { get; set; } = null!;
    }
}
