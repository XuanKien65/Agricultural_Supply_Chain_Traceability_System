namespace AgriTrace.Application.Features.Auth;

public record AuthUserDto(
    int UserId,
    string? FullName,
    string Email,
    string Role,
    int? OrganizationId,
    string? OrganizationName,
    string? OrganizationType);

public record LoginResultDto(
    string AccessToken,
    DateTime AccessTokenExpiresAt,
    string RefreshToken,
    DateTime RefreshTokenExpiresAt,
    AuthUserDto User);

public record RefreshTokenResultDto(
    string AccessToken,
    DateTime AccessTokenExpiresAt,
    string RefreshToken,
    DateTime RefreshTokenExpiresAt);
