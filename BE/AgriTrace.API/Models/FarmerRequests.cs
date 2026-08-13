namespace AgriTrace.API.Models;

public record CreateFarmerBatchRequest(int ProductId, int ProducerOrganizationId, int PerformedByUserId,
    DateOnly HarvestDate, decimal Weight, string? Location, string? HarvestNotes);
