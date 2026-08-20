using AgriTrace.Domain.Common;
using AgriTrace.Domain.Contracts;
using AgriTrace.Domain.Entities;

namespace AgriTrace.Domain.Interfaces;

public interface IInspectionRepository
{
    /// <summary>Lấy danh sách kiểm định của một lô hàng.</summary>
    Task<IReadOnlyList<InspectionDto>> GetByBatchAsync(int batchId, CancellationToken ct = default);

    /// <summary>Lấy chi tiết một kiểm định.</summary>
    Task<InspectionDto?> GetByIdAsync(int inspectionId, CancellationToken ct = default);

    /// <summary>Tạo kiểm định mới và tự động ghi event INSPECT.</summary>
    Task<InspectionDto> CreateAsync(int batchId, int inspectorId, string result, string? notes, CancellationToken ct = default);
}
