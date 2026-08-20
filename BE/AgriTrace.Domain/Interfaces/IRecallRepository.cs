using AgriTrace.Domain.Common;
using AgriTrace.Domain.Contracts;

namespace AgriTrace.Domain.Interfaces;

public interface IRecallRepository
{
    /// <summary>Lấy toàn bộ danh sách thu hồi.</summary>
    Task<PagedResult<RecallDto>> GetAllAsync(int page, int pageSize, CancellationToken ct = default);

    /// <summary>Kích hoạt thu hồi lô hàng.</summary>
    Task<RecallDto> CreateAsync(int batchId, string reason, string severity, int createdBy, CancellationToken ct = default);

    /// <summary>Giải quyết (resolve) một lệnh thu hồi.</summary>
    Task<RecallDto> ResolveAsync(int recallId, int resolvedBy, CancellationToken ct = default);

    /// <summary>Gửi thông báo thu hồi đến tất cả users liên quan đến lô hàng.</summary>
    Task PropagateNotificationsAsync(int recallId, int batchId, string batchCode, CancellationToken ct = default);
}
