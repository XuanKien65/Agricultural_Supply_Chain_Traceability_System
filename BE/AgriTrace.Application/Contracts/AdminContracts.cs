namespace AgriTrace.Application.Contracts;

public sealed record AdminRoleDto(
    string Name,
    string Description,
    int UserCount);

public sealed record AdminOrganizationDto(
    int Id,
    string Name,
    string Type,
    string Status,
    DateTime? CreatedAt);

public sealed record AdminUserDto(
    int Id,
    string? FullName,
    string Email,
    string Role,
    int? OrganizationId,
    string? OrganizationName,
    bool IsActive,
    DateTime? CreatedAt);

public sealed record AdminProductDto(
    int Id,
    string? Name,
    string? Category,
    string? Unit,
    int OrganizationId,
    string? OrganizationName);

public sealed record AdminBatchDto(
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

public sealed record AdminSupplyChainEventDto(
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

public sealed record AdminInspectionDto(
    int Id,
    int BatchId,
    string? BatchCode,
    int InspectorId,
    string? InspectorName,
    string? Result,
    string? Notes,
    DateTime? CreatedAt);

public sealed record AdminCertificateDto(
    int Id,
    int BatchId,
    string? BatchCode,
    int? InspectionId,
    string? CertificateType,
    string? FileUrl,
    DateTime? IssuedAt);

public sealed record AdminRecallDto(
    int Id,
    int BatchId,
    string? BatchCode,
    string? Reason,
    string? Severity,
    int CreatedBy,
    string? CreatedByName,
    DateTime? CreatedAt);

public sealed record AdminDashboardDto(
    int OrganizationCount,
    int UserCount,
    int BatchCount,
    int RecallCount,
    IReadOnlyList<AdminBatchDto> RecentBatches);