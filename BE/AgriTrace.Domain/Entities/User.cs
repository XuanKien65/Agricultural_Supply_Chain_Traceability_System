namespace AgriTrace.Domain.Entities;

/// <summary>
/// Tài khoản người dùng trong hệ thống.
/// Domain entity thuần – không chứa logic BCrypt (BCrypt thuộc Infrastructure).
/// </summary>
public sealed class User
{
    public int Id { get; private set; }
    public int RoleId { get; private set; }
    public int? OrganizationId { get; private set; }
    public string Username { get; private set; }
    public string PasswordHash { get; private set; }
    public string Email { get; private set; }
    public string? FullName { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public string Status { get; private set; }

    // Navigation (populated by repository)
    public string? RoleName { get; private set; }

    public const string StatusActive = "Active";
    public const string StatusInactive = "Inactive";

    public User(int id, int roleId, int? organizationId, string username, string passwordHash,
        string email, string? fullName, DateTime createdAt, string status, string? roleName = null)
    {
        if (string.IsNullOrWhiteSpace(username))
            throw new ArgumentException("Username cannot be empty.", nameof(username));
        if (string.IsNullOrWhiteSpace(email))
            throw new ArgumentException("Email cannot be empty.", nameof(email));
        if (string.IsNullOrWhiteSpace(passwordHash))
            throw new ArgumentException("Password hash cannot be empty.", nameof(passwordHash));

        Id = id;
        RoleId = roleId;
        OrganizationId = organizationId;
        Username = username.Trim().ToLowerInvariant();
        PasswordHash = passwordHash;
        Email = email.Trim().ToLowerInvariant();
        FullName = fullName?.Trim();
        CreatedAt = createdAt;
        Status = status;
        RoleName = roleName;
    }

    public bool IsActive => Status == StatusActive;

    public void Deactivate()
    {
        Status = StatusInactive;
    }

    public void Activate()
    {
        Status = StatusActive;
    }
}
