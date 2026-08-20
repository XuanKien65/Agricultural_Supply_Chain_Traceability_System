using AgriTrace.Domain.Contracts;

namespace AgriTrace.Domain.Interfaces;

public interface IAnalyticsRepository
{
    /// <summary>Tổng quan toàn hệ thống (ADMIN only).</summary>
    Task<OverviewDto> GetOverviewAsync(CancellationToken ct = default);

    /// <summary>Phân bổ lô hàng theo tổ chức.</summary>
    Task<BatchDistributionDto> GetBatchDistributionAsync(int? organizationId = null, CancellationToken ct = default);

    /// <summary>Thời gian xử lý trung bình giữa các sự kiện.</summary>
    Task<ProcessingTimeDto> GetProcessingTimeAsync(int? organizationId = null, CancellationToken ct = default);

    /// <summary>Truy vết ngược từ lô hàng lên nguồn gốc.</summary>
    Task<TracebackDto?> GetTracebackAsync(int batchId, CancellationToken ct = default);
}
