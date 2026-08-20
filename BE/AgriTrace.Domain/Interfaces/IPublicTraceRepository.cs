using AgriTrace.Domain.Contracts;

namespace AgriTrace.Domain.Interfaces;

public interface IPublicTraceRepository
{
    /// <summary>
    /// Tra cứu công khai đầy đủ thông tin lô hàng theo BatchId.
    /// Bao gồm: Batch, Events, Inspections, Certificates, Recalls.
    /// </summary>
    Task<PublicTraceDto?> GetPublicTraceAsync(int batchId, CancellationToken ct = default);

    /// <summary>Lấy đồ thị phả hệ lô hàng (Lineage).</summary>
    Task<LineageDto?> GetLineageAsync(int batchId, CancellationToken ct = default);
}
