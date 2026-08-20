namespace AgriTrace.Domain.Entities;

/// <summary>
/// Lệnh thu hồi lô hàng.
/// Khi kích hoạt, batch bị đánh dấu thu hồi và notifications được gửi.
/// </summary>
public sealed class Recall
{
    public int Id { get; private set; }
    public int BatchId { get; private set; }
    public string Reason { get; private set; }

    /// <summary>LOW / MEDIUM / HIGH / CRITICAL</summary>
    public string Severity { get; private set; }
    public int CreatedBy { get; private set; }
    public DateTime CreatedAt { get; private set; }

    /// <summary>ACTIVE / RESOLVED</summary>
    public string Status { get; private set; }
    public DateTime? ResolvedAt { get; private set; }
    public int? ResolvedBy { get; private set; }

    public Recall(int id, int batchId, string reason, string severity, int createdBy,
        DateTime? createdAt = null, string status = "ACTIVE",
        DateTime? resolvedAt = null, int? resolvedBy = null)
    {
        if (batchId <= 0) throw new ArgumentException("BatchId is required.", nameof(batchId));
        if (string.IsNullOrWhiteSpace(reason)) throw new ArgumentException("Reason is required.", nameof(reason));
        if (string.IsNullOrWhiteSpace(severity)) throw new ArgumentException("Severity is required.", nameof(severity));
        if (createdBy <= 0) throw new ArgumentException("CreatedBy is required.", nameof(createdBy));

        Id = id;
        BatchId = batchId;
        Reason = reason.Trim();
        Severity = severity.Trim().ToUpperInvariant();
        CreatedBy = createdBy;
        CreatedAt = createdAt ?? DateTime.UtcNow;
        Status = status;
        ResolvedAt = resolvedAt;
        ResolvedBy = resolvedBy;
    }
}
