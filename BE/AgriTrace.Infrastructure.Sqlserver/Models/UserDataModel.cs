using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AgriTrace.Infrastructure.Sqlserver.Models;

[Table("Users")]
public sealed class UserDataModel
{
    [Key]
    public int Id { get; set; }

    [MaxLength(200)]
    public string? FullName { get; set; }

    [Required, MaxLength(200)]
    public string Email { get; set; } = null!;

    [MaxLength(500)]
    public string? PasswordHash { get; set; }

    [Required, MaxLength(50)]
    public string Role { get; set; } = null!; // ADMIN / ORGADMIN / FARMER / OPERATOR / INSPECTOR

    public int? OrganizationId { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(OrganizationId))]
    public OrganizationDataModel? Organization { get; set; }
}
