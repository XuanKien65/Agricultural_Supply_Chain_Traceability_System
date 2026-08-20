using AgriTrace.Domain.Contracts;
using AgriTrace.Domain.Interfaces;
using AgriTrace.Infrastructure.Sqlserver.Models;
using AgriTrace.Infrastructure.Sqlserver.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AgriTrace.Infrastructure.Sqlserver.Repositories;

public sealed class NotificationRepository(ApplicationDbContext db) : INotificationRepository
{
    public async Task<IReadOnlyList<NotificationDto>> GetByUserAsync(int userId, CancellationToken ct = default)
    {
        var items = await db.Notifications
            .AsNoTracking()
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Select(n => new NotificationDto(
                n.Id,
                n.UserId,
                n.Title ?? "Thông báo",
                n.Message ?? string.Empty,
                n.IsRead,
                n.CreatedAt))
            .ToListAsync(ct);

        return items;
    }

    public async Task<int> GetUnreadCountAsync(int userId, CancellationToken ct = default)
    {
        return await db.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .CountAsync(ct);
    }

    public async Task MarkReadAsync(int notificationId, int userId, CancellationToken ct = default)
    {
        var notification = await db.Notifications
            .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId, ct)
            ?? throw new KeyNotFoundException($"Không tìm thấy thông báo ID = {notificationId}");

        notification.IsRead = true;
        await db.SaveChangesAsync(ct);
    }

    public async Task MarkAllReadAsync(int userId, CancellationToken ct = default)
    {
        var unread = await db.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ToListAsync(ct);

        foreach (var item in unread)
        {
            item.IsRead = true;
        }

        await db.SaveChangesAsync(ct);
    }

    public async Task CreateAsync(int userId, string title, string message, CancellationToken ct = default)
    {
        var notification = new NotificationDataModel
        {
            UserId = userId,
            Title = title.Trim(),
            Message = message.Trim(),
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };

        db.Notifications.Add(notification);
        await db.SaveChangesAsync(ct);
    }
}
