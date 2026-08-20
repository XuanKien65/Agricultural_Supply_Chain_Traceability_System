using AgriTrace.Domain.Common;
using AgriTrace.Domain.Entities;
using AgriTrace.Domain.Interfaces;
using AgriTrace.Infrastructure.Sqlserver.Models;
using AgriTrace.Infrastructure.Sqlserver.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AgriTrace.Infrastructure.Sqlserver.Repositories;

public sealed class OrganizationRepository(ApplicationDbContext db) : IOrganizationRepository
{
    public async Task<Organization?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var row = await db.Organizations.AsNoTracking().FirstOrDefaultAsync(o => o.Id == id, ct);
        return row is null ? null : MapToDomain(row);
    }

    public async Task<PagedResult<Organization>> GetAllPagedAsync(
        string? type, string? status, string? search, int page, int pageSize, CancellationToken ct = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = db.Organizations.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(type))
            query = query.Where(o => o.Type == type.Trim().ToUpper());

        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(o => o.Status == status.Trim().ToUpper());

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(o => o.Name.ToLower().Contains(term));
        }

        var total = await query.CountAsync(ct);
        var rows = await query
            .OrderByDescending(o => o.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return new PagedResult<Organization>(rows.Select(MapToDomain).ToList(), total);
    }

    public async Task<Organization> AddAsync(Organization org, CancellationToken ct = default)
    {
        var row = new OrganizationDataModel
        {
            Name = org.Name,
            Type = org.Type,
            Status = org.Status,
            CreatedAt = org.CreatedAt
        };

        db.Organizations.Add(row);
        await db.SaveChangesAsync(ct);

        return MapToDomain(row);
    }

    public async Task<Organization> UpdateAsync(Organization org, CancellationToken ct = default)
    {
        var row = await db.Organizations.FindAsync([org.Id], ct)
            ?? throw new InvalidOperationException("Không tìm thấy tổ chức.");

        row.Name = org.Name;
        row.Type = org.Type;

        await db.SaveChangesAsync(ct);
        return MapToDomain(row);
    }

    public async Task UpdateStatusAsync(int id, string status, CancellationToken ct = default)
    {
        var row = await db.Organizations.FindAsync([id], ct)
            ?? throw new InvalidOperationException("Không tìm thấy tổ chức.");

        row.Status = status.Trim().ToUpper();
        await db.SaveChangesAsync(ct);
    }

    private static Organization MapToDomain(OrganizationDataModel x) => new(
        x.Id,
        x.Name,
        x.Type,
        x.Status,
        x.CreatedAt);
}
