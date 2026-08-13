namespace AgriTrace.Domain.Entities;

public sealed record AdminOrganization(
    int Id,
    string Name,
    string Type,
    string Status,
    DateTime? CreatedAt);

public sealed record AdminUser(
    int Id,
    string? FullName,
    string Email,
    string Role,
    int? OrganizationId,
    string? OrganizationName,
    bool IsActive,
    DateTime? CreatedAt);

public sealed record AdminProduct(
    int Id,
    string? Name,
    string? Category,
    string? Unit,
    int OrganizationId,
    string? OrganizationName);

public sealed record AdminBatch(
    int Id,
    int ProductId,
    string? ProductName,
    string BatchCode,
    decimal Quantity,
    int? CurrentOrganizationId,
    string? CurrentOrganizationName,
    int? ParentBatchId,
    int? RootBatchId,
    string? QrCode,
    DateTime? CreatedAt);

public sealed record AdminSupplyChainEvent(
    int Id,
    int BatchId,
    string? BatchCode,
    string EventType,
    int OrganizationId,
    string? OrganizationName,
    int UserId,
    string? UserName,
    string? EventData,
    string? Location,
    string? PreviousHash,
    string? CurrentHash,
    DateTime? CreatedAt);

public sealed record AdminInspection(
    int Id,
    int BatchId,
    string? BatchCode,
    int InspectorId,
    string? InspectorName,
    string? Result,
    string? Notes,
    DateTime? CreatedAt);

public sealed record AdminCertificate(
    int Id,
    int BatchId,
    string? BatchCode,
    int? InspectionId,
    string? CertificateType,
    string? FileUrl,
    DateTime? IssuedAt);

public sealed record AdminRecall(
    int Id,
    int BatchId,
    string? BatchCode,
    string? Reason,
    string? Severity,
    int CreatedBy,
    string? CreatedByName,
    DateTime? CreatedAt);

public sealed record AdminDashboard(
    int OrganizationCount,
    int UserCount,
    int BatchCount,
    int RecallCount,
    IReadOnlyList<AdminBatch> RecentBatches);