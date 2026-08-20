namespace AgriTrace.API.Models;

// =========================
// AUTH REQUESTS
// =========================

public record RegisterRequest(
    string Username,
    string Email,
    string Password,
    string? FullName,
    int RoleId,
    int? OrganizationId);

public record LoginRequest(
    string Email,
    string Password);

public record UpdateUserStatusRequest(
    string Status);

public record RefreshTokenRequest(
    string AccessToken,
    string RefreshToken);