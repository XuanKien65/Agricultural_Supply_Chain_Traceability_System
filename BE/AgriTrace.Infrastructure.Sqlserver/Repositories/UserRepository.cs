using AgriTrace.Domain.Common;
using AgriTrace.Domain.Entities;
using AgriTrace.Domain.Interfaces;
using AgriTrace.Infrastructure.Sqlserver.Models;
using AgriTrace.Infrastructure.Sqlserver.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AgriTrace.Infrastructure.Sqlserver.Repositories;

public sealed class UserRepository(ApplicationDbContext db) : IUserRepository
{
    public async Task<User?> GetByEmailAsync(string email, CancellationToken ct = default)
    {
        var row = await db.Users
            .AsNoTracking()
            .Include(u => u.Organization)
            .FirstOrDefaultAsync(u => u.Email.ToLower() == email.Trim().ToLower(), ct);

        return row is null ? null : MapToDomain(row);
    }

    public async Task<User?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var row = await db.Users
            .AsNoTracking()
            .Include(u => u.Organization)
            .FirstOrDefaultAsync(u => u.Id == id, ct);

        return row is null ? null : MapToDomain(row);
    }

    public async Task<PagedResult<User>> GetAllPagedAsync(
        int? organizationId, string? role, bool? isActive, string? search, int page, int pageSize, CancellationToken ct = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = db.Users
            .AsNoTracking()
            .Include(u => u.Organization)
            .AsQueryable();

        if (organizationId.HasValue)
            query = query.Where(u => u.OrganizationId == organizationId.Value);

        if (!string.IsNullOrWhiteSpace(role))
            query = query.Where(u => u.Role == role.Trim().ToUpper());

        if (isActive.HasValue)
            query = query.Where(u => u.IsActive == isActive.Value);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(u => (u.FullName != null && u.FullName.ToLower().Contains(term)) || u.Email.ToLower().Contains(term));
        }

        var total = await query.CountAsync(ct);
        var rows = await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return new PagedResult<User>(rows.Select(MapToDomain).ToList(), total);
    }

    public async Task<User> AddAsync(User user, CancellationToken ct = default)
    {
        var row = new UserDataModel
        {
            FullName = user.FullName,
            Email = user.Email.ToLower(),
            PasswordHash = user.PasswordHash,
            Role = user.Role,
            OrganizationId = user.OrganizationId,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt
        };

        db.Users.Add(row);
        await db.SaveChangesAsync(ct);

        return (await GetByIdAsync(row.Id, ct))!;
    }

    public async Task<User> UpdateAsync(User user, CancellationToken ct = default)
    {
        var row = await db.Users.FindAsync([user.Id], ct)
            ?? throw new InvalidOperationException("Không tìm thấy người dùng.");

        row.FullName = user.FullName;
        row.Role = user.Role;
        if (user.OrganizationId.HasValue) row.OrganizationId = user.OrganizationId;

        await db.SaveChangesAsync(ct);
        return (await GetByIdAsync(row.Id, ct))!;
    }

    public async Task UpdateStatusAsync(int userId, bool isActive, CancellationToken ct = default)
    {
        var row = await db.Users.FindAsync([userId], ct)
            ?? throw new InvalidOperationException("Không tìm thấy người dùng.");

        row.IsActive = isActive;
        await db.SaveChangesAsync(ct);
    }

    public async Task UpdatePasswordAsync(int userId, string passwordHash, CancellationToken ct = default)
    {
        var row = await db.Users.FindAsync([userId], ct)
            ?? throw new InvalidOperationException("Không tìm thấy người dùng.");

        row.PasswordHash = passwordHash;
        await db.SaveChangesAsync(ct);
    }

    private static User MapToDomain(UserDataModel x) => new(
        x.Id,
        x.FullName,
        x.Email,
        x.PasswordHash,
        x.Role,
        x.OrganizationId,
        x.IsActive,
        x.CreatedAt,
        x.Organization?.Name,
        x.Organization?.Type);
}
