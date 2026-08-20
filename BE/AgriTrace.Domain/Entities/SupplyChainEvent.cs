namespace AgriTrace.Domain.Entities;

public sealed class SupplyChainEvent
{
    public int Id { get; private set; }
    public int BatchId { get; private set; }
    public string EventType { get; private set; }
    public int OrganizationId { get; private set; }
    public int UserId { get; private set; }
    public string? EventData { get; private set; }
    public string? Location { get; private set; }
    public string? PreviousHash { get; private set; }
    public string? CurrentHash { get; private set; }
    public DateTime CreatedAt { get; private set; }

    public SupplyChainEvent(int id, int batchId, string eventType, int organizationId, int userId,
        string? eventData, string? location, string? previousHash, string? currentHash, DateTime? createdAt = null)
    {
        Id = id;
        BatchId = batchId;
        EventType = eventType;
        OrganizationId = organizationId;
        UserId = userId;
        EventData = eventData;
        Location = location;
        PreviousHash = previousHash;
        CurrentHash = currentHash;
        CreatedAt = createdAt ?? DateTime.UtcNow;
    }
}
