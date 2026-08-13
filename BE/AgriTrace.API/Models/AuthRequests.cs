namespace AgriTrace.API.Models;

// ---- Auth Requests ----

/// <summary>Request body cho POST /api/auth/register</summary>
public record RegisterRequest(
    string Username,
    string Email,
    string Password,
    string? FullName,
    int RoleId,
    int? OrganizationId);

/// <summary>Request body cho POST /api/auth/login</summary>
public record LoginRequest(
    string Username,
    string Password);

/// <summary>Request body cho PUT /api/admin/users/{id}/status</summary>
public record UpdateUserStatusRequest(string Status);
