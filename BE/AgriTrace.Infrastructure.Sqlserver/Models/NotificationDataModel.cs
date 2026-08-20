using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AgriTrace.Infrastructure.Sqlserver.Models;

[Table("Notifications")]
public sealed class NotificationDataModel
{
    [Key]
    public int Id { get; set; }

    public int UserId { get; set; }

    [MaxLength(200)]
    public string? Title { get; set; }

    public string? Message { get; set; }

    public bool IsRead { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(UserId))]
    public UserDataModel User { get; set; } = null!;
}
