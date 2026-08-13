using AgriTrace.Domain.Entities;

namespace AgriTrace.Domain.Interfaces;

/// <summary>
/// Service sinh JWT token – implementation nằm ở Infrastructure.
/// </summary>
public interface IJwtTokenService
{
    /// <summary>Sinh JWT token cho user đã xác thực.</summary>
    string GenerateToken(User user);
}
