namespace AgriTrace.Domain.Entities;

/// <summary>
/// Kết quả kiểm định chất lượng lô hàng.
/// Mỗi lần kiểm định tự động ghi sự kiện INSPECT trong SupplyChainEvents.
/// </summary>
public sealed class Inspection
{
    public int Id { get; private set; }
    public int BatchId { get; private set; }
    public int InspectorId { get; private set; }

    /// <summary>PASS / FAIL / PENDING</summary>
    public string Result { get; private set; }
    public string? Notes { get; private set; }
    public DateTime CreatedAt { get; private set; }

    public Inspection(int id, int batchId, int inspectorId, string result, string? notes, DateTime? createdAt = null)
    {
        if (batchId <= 0) throw new ArgumentException("BatchId is required.", nameof(batchId));
        if (inspectorId <= 0) throw new ArgumentException("InspectorId is required.", nameof(inspectorId));
        if (string.IsNullOrWhiteSpace(result)) throw new ArgumentException("Result is required.", nameof(result));

        Id = id;
        BatchId = batchId;
        InspectorId = inspectorId;
        Result = result.Trim().ToUpperInvariant();
        Notes = notes?.Trim();
        CreatedAt = createdAt ?? DateTime.UtcNow;
    }
}
