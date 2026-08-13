namespace AgriTrace.Application.Contracts;

public record ProductDto(int ProductId, string Name, string? Unit, string? Description);
public record BatchEventDto(int EventId, string EventType, DateTime EventTime, string? Location, string? AdditionalData, string? PreviousHash, string CurrentHash);
public record FarmerBatchDto(int BatchId, string BatchCode, int ProductId, string ProductName, string? Unit,
    int ProducerOrganizationId, DateOnly? HarvestDate, decimal Weight, string Status, string QrCode,
    DateTime CreatedAt, IReadOnlyList<BatchEventDto> Events);
public record CreateFarmerBatchResult(int BatchId, string BatchCode, string QrCode);
public record FarmerDashboardDto(int TotalBatches, int CreatedBatches, int RecalledBatches, decimal TotalWeight, IReadOnlyList<FarmerBatchDto> RecentBatches);
