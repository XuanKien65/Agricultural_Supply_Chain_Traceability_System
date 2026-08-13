namespace AgriTrace.Domain.Entities;

public sealed class Batch
{
    private readonly List<SupplyChainEvent> _events = [];
    public int Id { get; private set; }
    public int ProductId { get; private set; }
    public int ProducerOrganizationId { get; private set; }
    public int? ParentBatchId { get; private set; }
    public string QrCode { get; private set; }
    public DateOnly? HarvestDate { get; private set; }
    public decimal Weight { get; private set; }
    public string Status { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public IReadOnlyCollection<SupplyChainEvent> Events => _events.AsReadOnly();

    public Batch(int id, int productId, int producerOrganizationId, int? parentBatchId, string qrCode,
        DateOnly? harvestDate, decimal weight, string status, DateTime createdAt,
        IEnumerable<SupplyChainEvent>? events = null)
    {
        if (productId <= 0) throw new ArgumentException("Product is required.", nameof(productId));
        if (producerOrganizationId <= 0) throw new ArgumentException("Producer organization is required.", nameof(producerOrganizationId));
        if (weight <= 0) throw new ArgumentException("Weight must be greater than zero.", nameof(weight));
        Id = id; ProductId = productId; ProducerOrganizationId = producerOrganizationId; ParentBatchId = parentBatchId;
        QrCode = qrCode; HarvestDate = harvestDate; Weight = weight; Status = status; CreatedAt = createdAt;
        if (events is not null) _events.AddRange(events.OrderBy(x => x.EventTime));
    }

    public void AddHarvestEvent(int organizationId, int userId, DateTime eventTime, string? location, string? data)
    {
        var previous = _events.LastOrDefault();
        _events.Add(new SupplyChainEvent(0, Id, organizationId, userId, previous?.Id, "HARVEST",
            eventTime, location, data, previous?.Hash));
    }
}
