namespace AgriTrace.Domain.Entities;

public sealed class Batch
{
    private readonly List<SupplyChainEvent> _events = [];

    public int Id { get; private set; }
    public int ProductId { get; private set; }
    public string BatchCode { get; private set; }
    public decimal Quantity { get; private set; }
    public int? CurrentOrganizationId { get; private set; }
    public int? ParentBatchId { get; private set; }
    public int? RootBatchId { get; private set; }
    public string? QrCode { get; private set; }
    public DateTime CreatedAt { get; private set; }

    public IReadOnlyCollection<SupplyChainEvent> Events => _events.AsReadOnly();

    public Batch(int id, int productId, string batchCode, decimal quantity, int? currentOrganizationId,
        int? parentBatchId, int? rootBatchId, string? qrCode, DateTime? createdAt = null,
        IEnumerable<SupplyChainEvent>? events = null)
    {
        if (productId <= 0) throw new ArgumentException("ProductId is required.", nameof(productId));
        if (string.IsNullOrWhiteSpace(batchCode)) throw new ArgumentException("BatchCode is required.", nameof(batchCode));
        if (quantity < 0) throw new ArgumentException("Quantity cannot be negative.", nameof(quantity));

        Id = id;
        ProductId = productId;
        BatchCode = batchCode.Trim();
        Quantity = quantity;
        CurrentOrganizationId = currentOrganizationId;
        ParentBatchId = parentBatchId;
        RootBatchId = rootBatchId;
        QrCode = qrCode;
        CreatedAt = createdAt ?? DateTime.UtcNow;

        if (events is not null) _events.AddRange(events);
    }
}
