using AgriTrace.Domain.Interfaces;
using AgriTrace.Infrastructure.Sqlserver.Models;
using AgriTrace.Infrastructure.Sqlserver.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AgriTrace.Infrastructure.Sqlserver.Repositories;

public sealed class RefreshTokenRepository(ApplicationDbContext db) : IRefreshTokenRepository
{
    public async Task AddAsync(int userId, string token, DateTime expiresAt, CancellationToken ct = default)
    {
        db.RefreshTokens.Add(new RefreshTokenDataModel
        {
            UserId = userId,
            Token = token,
            ExpiresAt = expiresAt,
        });
        await db.SaveChangesAsync(ct);
    }

    public async Task<RefreshTokenRecord?> GetAsync(string token, CancellationToken ct = default)
    {
        var row = await db.RefreshTokens
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Token == token, ct);

        return row is null ? null : new RefreshTokenRecord(row.UserId, row.ExpiresAt, row.RevokedAt);
    }

    public async Task RevokeAsync(string token, CancellationToken ct = default)
    {
        var row = await db.RefreshTokens.FirstOrDefaultAsync(x => x.Token == token, ct);
        if (row is null || row.RevokedAt is not null) return;

        row.RevokedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
    }
}
