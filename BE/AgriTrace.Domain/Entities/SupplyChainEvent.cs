using System.Security.Cryptography;
using System.Text;

namespace AgriTrace.Domain.Entities;

public sealed class SupplyChainEvent
{
    public static readonly string[] Order = ["HARVEST", "PROCESS", "PACKAGE", "TRANSPORT", "DISTRIBUTE", "RETAIL"];

    public int Id { get; private set; }
    public int BatchId { get; private set; }
    public int OrganizationId { get; private set; }
    public int PerformedByUserId { get; private set; }
    public int? PreviousEventId { get; private set; }
    public string EventType { get; private set; }
    public DateTime EventTime { get; private set; }
    public string? Location { get; private set; }
    public string? AdditionalData { get; private set; }
    public string Hash { get; private set; }
    public string? PreviousHash { get; private set; }
    public string? DigitalSignature { get; private set; }

    public SupplyChainEvent(int id, int batchId, int organizationId, int userId, int? previousEventId,
        string eventType, DateTime eventTime, string? location, string? additionalData,
        string? previousHash, string? hash = null, string? digitalSignature = null)
    {
        if (Array.IndexOf(Order, eventType) < 0) throw new ArgumentException($"Unknown event type '{eventType}'.", nameof(eventType));
        Id = id; BatchId = batchId; OrganizationId = organizationId; PerformedByUserId = userId;
        PreviousEventId = previousEventId; EventType = eventType; EventTime = eventTime;
        Location = location?.Trim(); AdditionalData = additionalData; PreviousHash = previousHash;
        Hash = hash ?? ComputeHash(batchId, organizationId, userId, eventType, eventTime, location, additionalData, previousHash);
        DigitalSignature = digitalSignature;
    }

    public static string ComputeHash(int batchId, int organizationId, int userId, string eventType,
        DateTime eventTime, string? location, string? data, string? previousHash)
    {
        var canonical = $"{batchId}|{organizationId}|{userId}|{eventType}|{eventTime.ToUniversalTime():O}|{location}|{data}|{previousHash}";
        return Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(canonical))).ToLowerInvariant();
    }
}
