namespace AgriTrace.Domain.Contracts;

public record LineageNode(int BatchId, string BatchCode, decimal Quantity);

public record LineageEdge(int SourceBatchId, int TargetBatchId, string? RelationType);

public record LineageResult(IReadOnlyList<LineageNode> Nodes, IReadOnlyList<LineageEdge> Edges);
