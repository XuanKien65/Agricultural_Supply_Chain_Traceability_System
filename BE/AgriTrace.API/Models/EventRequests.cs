namespace AgriTrace.API.Models;

public record AppendSupplyChainEventRequest(int OrganizationId, int PerformedByUserId, string EventType,
    DateTime? EventTime, string? Location, string? AdditionalData);
