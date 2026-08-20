using AgriTrace.Domain.Contracts;

namespace AgriTrace.Domain.Interfaces;

public interface ICertificateRepository
{
    /// <summary>Lấy danh sách chứng nhận của một lô hàng.</summary>
    Task<IReadOnlyList<CertificateDto>> GetByBatchAsync(int batchId, CancellationToken ct = default);

    /// <summary>Tạo chứng nhận mới cho lô hàng.</summary>
    Task<CertificateDto> CreateAsync(int batchId, int? inspectionId, string certificateType, string fileUrl, CancellationToken ct = default);
}
