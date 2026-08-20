using AgriTrace.Domain.Contracts;

namespace AgriTrace.Domain.Interfaces;

public interface IRecallNotificationRepository
{
    /// <summary>Tạo RecallNotification cho tất cả Organization tham gia chuỗi sự kiện của Batch.</summary>
    Task PropagateRecallNotificationsAsync(int recallId, int batchId, CancellationToken ct = default);

    /// <summary>Lấy danh sách thông báo thu hồi cho một Organization.</summary>
    Task<IReadOnlyList<RecallNotificationDto>> GetByOrganizationAsync(int organizationId, CancellationToken ct = default);

    /// <summary>Lấy chi tiết Recall kèm danh sách thông báo.</summary>
    Task<RecallDetailDto?> GetRecallDetailAsync(int recallId, CancellationToken ct = default);

    /// <summary>Xác nhận đã nhận thông báo thu hồi.</summary>
    Task AcknowledgeAsync(int notificationId, string? processingNotes, CancellationToken ct = default);
}
