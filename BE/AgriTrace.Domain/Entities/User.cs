namespace AgriTrace.Domain.Entities;

/// <summary>
/// Tài khoản người dùng trong hệ thống theo Schema V2.0.
/// </summary>
public sealed class User
{
    public int Id { get; private set; }
    public string? FullName { get; private set; }
    public string Email { get; private set; }
    public string? PasswordHash { get; private set; }
    public string Role { get; private set; } // ADMIN, ORGADMIN, FARMER, OPERATOR, INSPECTOR
    public int? OrganizationId { get; private set; }
    public bool IsActive { get; private set; }
    public DateTime CreatedAt { get; private set; }

    // Nav / Joined fields
    public string? OrganizationName { get; private set; }
    public string? OrganizationType { get; private set; }

    public User(int id, string? fullName, string email, string? passwordHash, string role,
        int? organizationId, bool isActive = true, DateTime? createdAt = null,
        string? organizationName = null, string? organizationType = null)
    {
        if (string.IsNullOrWhiteSpace(email))
            throw new ArgumentException("Email cannot be empty.", nameof(email));
        if (string.IsNullOrWhiteSpace(role))
            throw new ArgumentException("Role cannot be empty.", nameof(role));

        Id = id;
        FullName = fullName?.Trim();
        Email = email.Trim().ToLowerInvariant();
        PasswordHash = passwordHash;
        Role = role.Trim().ToUpperInvariant();
        OrganizationId = organizationId;
        IsActive = isActive;
        CreatedAt = createdAt ?? DateTime.UtcNow;
        OrganizationName = organizationName;
        OrganizationType = organizationType;
    }

    public void SetPasswordHash(string newHash)
    {
        PasswordHash = newHash;
    }

    public void UpdateProfile(string? fullName, string role)
    {
        FullName = fullName?.Trim();
        Role = role.Trim().ToUpperInvariant();
    }

    public void SetActive(bool isActive)
    {
        IsActive = isActive;
    }
}
