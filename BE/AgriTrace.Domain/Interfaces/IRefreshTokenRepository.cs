namespace AgriTrace.Domain.Interfaces;

public record RefreshTokenRecord(int UserId, DateTime ExpiresAt, DateTime? RevokedAt);

public interface IRefreshTokenRepository
{
    Task AddAsync(int userId, string token, DateTime expiresAt, CancellationToken ct = default);
    Task<RefreshTokenRecord?> GetAsync(string token, CancellationToken ct = default);
    Task RevokeAsync(string token, CancellationToken ct = default);
}
