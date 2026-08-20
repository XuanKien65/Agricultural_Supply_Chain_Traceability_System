namespace AgriTrace.Domain.Entities;

/// <summary>
/// Chứng nhận tiêu chuẩn cho lô hàng (VietGAP, GlobalGAP, Organic, ISO...).
/// </summary>
public sealed class Certificate
{
    public int Id { get; private set; }
    public int BatchId { get; private set; }
    public int? InspectionId { get; private set; }

    /// <summary>VietGAP / GlobalGAP / Organic / ISO / ...</summary>
    public string CertificateType { get; private set; }
    public string FileUrl { get; private set; }
    public DateTime IssuedAt { get; private set; }

    public Certificate(int id, int batchId, int? inspectionId, string certificateType, string fileUrl, DateTime? issuedAt = null)
    {
        if (batchId <= 0) throw new ArgumentException("BatchId is required.", nameof(batchId));
        if (string.IsNullOrWhiteSpace(certificateType)) throw new ArgumentException("CertificateType is required.", nameof(certificateType));
        if (string.IsNullOrWhiteSpace(fileUrl)) throw new ArgumentException("FileUrl is required.", nameof(fileUrl));

        Id = id;
        BatchId = batchId;
        InspectionId = inspectionId;
        CertificateType = certificateType.Trim();
        FileUrl = fileUrl.Trim();
        IssuedAt = issuedAt ?? DateTime.UtcNow;
    }
}
