using AgriTrace.Domain.Exceptions;

namespace AgriTrace.Domain.Entities;

public sealed class Batch
{
    private static readonly Dictionary<string, string> StatusByEventType = new()
    {
        ["PROCESS"] = "Processed",
        ["PACKAGE"] = "Processed",
        ["TRANSPORT"] = "InTransit",
        ["DISTRIBUTE"] = "Distributed",
        ["RETAIL"] = "Distributed",
    };

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
        if (weight <= 0) throw new ArgumentException("Khối lượng phải lớn hơn 0.", nameof(weight));
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

    /// Ghi sự kiện chuỗi cung ứng kế tiếp — chỉ chấp nhận đúng bước liền sau sự kiện gần nhất.
    public SupplyChainEvent AppendEvent(string eventType, int organizationId, int userId, DateTime eventTime, string? location, string? data)
    {
        if (Array.IndexOf(SupplyChainEvent.Order, eventType) < 0)
            throw new ArgumentException($"Unknown event type '{eventType}'.", nameof(eventType));

        const string sequenceErrorMessage = "Loại sự kiện không hợp lệ với trạng thái hiện tại của lô hàng.";
        var last = _events.LastOrDefault() ?? throw new InvalidEventSequenceException(sequenceErrorMessage);
        var lastIndex = Array.IndexOf(SupplyChainEvent.Order, last.EventType);
        var expected = lastIndex + 1 < SupplyChainEvent.Order.Length ? SupplyChainEvent.Order[lastIndex + 1] : null;
        if (expected is null || eventType != expected)
            throw new InvalidEventSequenceException(sequenceErrorMessage);

        var next = new SupplyChainEvent(0, Id, organizationId, userId, last.Id, eventType, eventTime, location, data, last.Hash);
        _events.Add(next);
        if (StatusByEventType.TryGetValue(eventType, out var status)) Status = status;
        return next;
    }
}
