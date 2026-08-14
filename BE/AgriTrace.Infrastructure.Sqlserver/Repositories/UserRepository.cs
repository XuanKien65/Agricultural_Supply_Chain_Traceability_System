using AgriTrace.Domain.Common;
using AgriTrace.Domain.Entities;
using AgriTrace.Domain.Interfaces;
using AgriTrace.Infrastructure.Sqlserver.Models;
using AgriTrace.Infrastructure.Sqlserver.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AgriTrace.Infrastructure.Sqlserver.Repositories;

public sealed class UserRepository(ApplicationDbContext db) : IUserRepository
{
    public async Task<User?> GetByUsernameAsync(string username, CancellationToken ct = default)
    {
        var input = username.Trim().ToLowerInvariant();
        var row = await db.Users.AsNoTracking()
            .Include(x => x.Role)
            .FirstOrDefaultAsync(x => x.Username.ToLower() == input || x.Email.ToLower() == input, ct);
        return row is null ? null : Map(row);
    }

    public async Task<User?> GetByEmailAsync(string email, CancellationToken ct = default)
    {
        var row = await db.Users.AsNoTracking()
            .Include(x => x.Role)
            .FirstOrDefaultAsync(x => x.Email == email.ToLowerInvariant(), ct);
        return row is null ? null : Map(row);
    }

    public async Task<User?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var row = await db.Users.AsNoTracking()
            .Include(x => x.Role)
            .FirstOrDefaultAsync(x => x.Id == id, ct);
        return row is null ? null : Map(row);
    }

    public async Task<User> AddAsync(User user, CancellationToken ct = default)
    {
        var row = new UserDataModel
        {
            RoleId = user.RoleId,
            OrganizationId = user.OrganizationId,
            Username = user.Username,
            PasswordHash = user.PasswordHash,
            Email = user.Email,
            FullName = user.FullName,
            CreatedAt = user.CreatedAt,
            Status = user.Status
        };
        db.Users.Add(row);
        await db.SaveChangesAsync(ct);

        // Reload with Role to populate RoleName
        await db.Entry(row).Reference(x => x.Role).LoadAsync(ct);
        return Map(row);
    }

    public async Task UpdateStatusAsync(int userId, string status, CancellationToken ct = default)
    {
        await db.Users
            .Where(x => x.Id == userId)
            .ExecuteUpdateAsync(s => s.SetProperty(x => x.Status, status), ct);
    }

    public async Task<PagedResult<User>> GetAllPagedAsync(string? search, string? roleFilter,
        int page, int pageSize, CancellationToken ct = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = db.Users.AsNoTracking().Include(x => x.Role).AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(x => x.Username.Contains(search) || x.Email.Contains(search) || (x.FullName != null && x.FullName.Contains(search)));

        if (!string.IsNullOrWhiteSpace(roleFilter))
            query = query.Where(x => x.Role.Name == roleFilter);

        var total = await query.CountAsync(ct);
        var rows = await query
            .OrderByDescending(x => x.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return new PagedResult<User>(rows.Select(Map).ToList().AsReadOnly(), total);
    }

    public async Task<int?> GetOrganizationIdAsync(int userId, CancellationToken ct = default)
    {
        return await db.Users.AsNoTracking()
            .Where(x => x.Id == userId)
            .Select(x => x.OrganizationId)
            .FirstOrDefaultAsync(ct);
    }

    private static User Map(UserDataModel x) =>
        new(x.Id, x.RoleId, x.OrganizationId, x.Username, x.PasswordHash,
            x.Email, x.FullName, x.CreatedAt, x.Status, x.Role?.Name);
}
