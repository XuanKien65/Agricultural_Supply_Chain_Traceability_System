using AgriTrace.Domain.Contracts;

namespace AgriTrace.Domain.Interfaces;

public interface INotificationRepository
{
    /// <summary>Lấy danh sách thông báo của user hiện tại.</summary>
    Task<IReadOnlyList<NotificationDto>> GetByUserAsync(int userId, CancellationToken ct = default);

    /// <summary>Số thông báo chưa đọc của user.</summary>
    Task<int> GetUnreadCountAsync(int userId, CancellationToken ct = default);

    /// <summary>Đánh dấu một thông báo đã đọc.</summary>
    Task MarkReadAsync(int notificationId, int userId, CancellationToken ct = default);

    /// <summary>Đánh dấu tất cả thông báo của user đã đọc.</summary>
    Task MarkAllReadAsync(int userId, CancellationToken ct = default);

    /// <summary>Tạo thông báo mới cho một user.</summary>
    Task CreateAsync(int userId, string title, string message, CancellationToken ct = default);
}
