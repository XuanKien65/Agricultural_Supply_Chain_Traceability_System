using System.Security.Claims;
using AgriTrace.Domain.Entities;

namespace AgriTrace.Domain.Interfaces;

/// <summary>
/// Service sinh và xử lý JWT token.
/// </summary>
public interface IJwtTokenService
{
    /// <summary>Sinh JWT token cho user đã xác thực.</summary>
    string GenerateToken(User user);

    /// <summary>Sinh Refresh Token ngẫu nhiên an toàn.</summary>
    string GenerateRefreshToken();

    /// <summary>Trích xuất ClaimsPrincipal từ Access Token đã hết hạn.</summary>
    ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);
}
