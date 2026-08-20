namespace AgriTrace.API.Models;

public record SplitChildApiRequest(decimal Quantity);

public record SplitBatchRequest(int OrganizationId, int PerformedByUserId, IReadOnlyList<SplitChildApiRequest> ChildBatches, string? Location, DateTime? EventTime);

public record MergeSourceApiRequest(int BatchId, decimal Quantity);
public record MergeBatchesRequest(IReadOnlyList<MergeSourceApiRequest> Sources, int OrganizationId, int PerformedByUserId, string? Location, string? Description, DateTime? EventTime);
