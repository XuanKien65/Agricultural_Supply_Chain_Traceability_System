using AgriTrace.Domain.Common;
using AgriTrace.Domain.Contracts;
using AgriTrace.Domain.Interfaces;
using AgriTrace.Infrastructure.Sqlserver.Models;
using AgriTrace.Infrastructure.Sqlserver.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AgriTrace.Infrastructure.Sqlserver.Repositories;

public sealed class RecallRepository(ApplicationDbContext db) : IRecallRepository
{
    public async Task<PagedResult<RecallDto>> GetAllAsync(int page, int pageSize, CancellationToken ct = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = db.Recalls
            .AsNoTracking()
            .Include(r => r.Batch)
            .Include(r => r.Creator);

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(r => r.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(r => new RecallDto(
                r.Id,
                r.BatchId,
                r.Batch != null ? r.Batch.BatchCode : null,
                r.Reason ?? string.Empty,
                r.Severity ?? "MEDIUM",
                r.CreatedBy,
                r.Creator != null ? r.Creator.FullName : null,
                r.CreatedAt,
                r.Status ?? "ACTIVE",
                r.ResolvedAt))
            .ToListAsync(ct);

        return new PagedResult<RecallDto>(items, total);
    }

    public async Task<RecallDto> CreateAsync(int batchId, string reason, string severity, int createdBy, CancellationToken ct = default)
    {
        var batch = await db.Batches.FirstOrDefaultAsync(b => b.Id == batchId, ct)
            ?? throw new KeyNotFoundException($"Không tìm thấy lô hàng với ID = {batchId}");

        var creator = await db.Users.FirstOrDefaultAsync(u => u.Id == createdBy, ct)
            ?? throw new KeyNotFoundException($"Không tìm thấy người dùng với ID = {createdBy}");

        var recall = new RecallDataModel
        {
            BatchId = batchId,
            Reason = reason.Trim(),
            Severity = severity.Trim().ToUpperInvariant(),
            CreatedBy = createdBy,
            CreatedAt = DateTime.UtcNow,
            Status = "ACTIVE"
        };

        db.Recalls.Add(recall);
        await db.SaveChangesAsync(ct);

        // Lan truyền cảnh báo thông báo (Notifications) cho các bên liên quan
        await PropagateNotificationsAsync(recall.Id, batchId, batch.BatchCode, ct);

        return new RecallDto(
            recall.Id,
            recall.BatchId,
            batch.BatchCode,
            recall.Reason,
            recall.Severity,
            recall.CreatedBy,
            creator.FullName,
            recall.CreatedAt,
            recall.Status,
            recall.ResolvedAt);
    }

    public async Task<RecallDto> ResolveAsync(int recallId, int resolvedBy, CancellationToken ct = default)
    {
        var recall = await db.Recalls
            .Include(r => r.Batch)
            .Include(r => r.Creator)
            .FirstOrDefaultAsync(r => r.Id == recallId, ct)
            ?? throw new KeyNotFoundException($"Không tìm thấy lệnh thu hồi với ID = {recallId}");

        recall.Status = "RESOLVED";
        recall.ResolvedAt = DateTime.UtcNow;
        recall.ResolvedBy = resolvedBy;

        await db.SaveChangesAsync(ct);

        return new RecallDto(
            recall.Id,
            recall.BatchId,
            recall.Batch?.BatchCode,
            recall.Reason ?? string.Empty,
            recall.Severity ?? "MEDIUM",
            recall.CreatedBy,
            recall.Creator?.FullName,
            recall.CreatedAt,
            recall.Status,
            recall.ResolvedAt);
    }

    public async Task PropagateNotificationsAsync(int recallId, int batchId, string batchCode, CancellationToken ct = default)
    {
        // 1. Tìm các user thuộc các tổ chức đã tham gia vào batch này
        var orgIds = await db.SupplyChainEvents
            .Where(e => e.BatchId == batchId)
            .Select(e => e.OrganizationId)
            .Distinct()
            .ToListAsync(ct);

        var batch = await db.Batches.AsNoTracking().FirstOrDefaultAsync(b => b.Id == batchId, ct);
        if (batch?.CurrentOrganizationId.HasValue == true && !orgIds.Contains(batch.CurrentOrganizationId.Value))
        {
            orgIds.Add(batch.CurrentOrganizationId.Value);
        }

        var users = await db.Users
            .Where(u => u.IsActive && (u.Role == "ADMIN" || (u.OrganizationId.HasValue && orgIds.Contains(u.OrganizationId.Value))))
            .ToListAsync(ct);

        var now = DateTime.UtcNow;
        var notifications = users.Select(u => new NotificationDataModel
        {
            UserId = u.Id,
            Title = "Cảnh báo thu hồi sản phẩm",
            Message = $"Lô hàng {batchCode} đã bị kích hoạt cảnh báo thu hồi.",
            IsRead = false,
            CreatedAt = now
        }).ToList();

        if (notifications.Count > 0)
        {
            db.Notifications.AddRange(notifications);
            await db.SaveChangesAsync(ct);
        }
    }
}
