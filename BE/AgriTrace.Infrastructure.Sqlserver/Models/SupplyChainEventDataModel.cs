namespace AgriTrace.Infrastructure.Sqlserver.Models;

public sealed class SupplyChainEventDataModel
{
    public int Id { get; set; }
    public int BatchId { get; set; }
    public int OrganizationId { get; set; }
    public int PerformedByUserId { get; set; }
    public int? PreviousEventId { get; set; }
    public string EventType { get; set; } = null!;
    public DateTime EventTime { get; set; }
    public string? Location { get; set; }
    public string? AdditionalData { get; set; }
    public string Hash { get; set; } = null!;
    public string? PreviousHash { get; set; }
    public string? DigitalSignature { get; set; }
    public BatchDataModel Batch { get; set; } = null!;
}
