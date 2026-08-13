namespace AgriTrace.Infrastructure.Sqlserver.Models;

public sealed class UserDataModel
{
    public int Id { get; set; }
    public int RoleId { get; set; }
    public int? OrganizationId { get; set; }
    public string Username { get; set; } = null!;
    public string PasswordHash { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string? FullName { get; set; }
    public DateTime CreatedAt { get; set; }
    public string Status { get; set; } = null!;

    // Navigation
    public RoleDataModel Role { get; set; } = null!;
}
