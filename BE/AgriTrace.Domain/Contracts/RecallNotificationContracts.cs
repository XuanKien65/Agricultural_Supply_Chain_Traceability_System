namespace AgriTrace.Domain.Contracts;

// ─── Recall DTOs ──────────────────────────────────────────────────

public record RecallDto(
    int RecallId,
    int BatchId,
    string? BatchCode,
    string Reason,
    string Severity,
    int CreatedBy,
    string? CreatedByName,
    DateTime CreatedAt,
    string Status,
    DateTime? ResolvedAt);

// ─── Notification DTOs ────────────────────────────────────────────

public record NotificationDto(
    int NotificationId,
    int UserId,
    string Title,
    string Message,
    bool IsRead,
    DateTime CreatedAt);

public record UnreadCountDto(int UnreadCount);

// ─── Public Trace Extra DTOs ──────────────────────────────────────

public record PublicTraceDto(
    PublicBatchDto Batch,
    IReadOnlyList<PublicEventDto> Events,
    IReadOnlyList<PublicInspectionDto> Inspections,
    IReadOnlyList<PublicCertificateDto> Certificates,
    IReadOnlyList<PublicRecallDto> Recalls);

public record PublicBatchDto(
    int BatchId,
    string BatchCode,
    string ProductName,
    string? ProductCategory,
    decimal Quantity,
    string? CurrentOrganizationName,
    string QrCode,
    DateTime CreatedAt);

public record PublicEventDto(
    string EventType,
    string? OrganizationName,
    string? Location,
    string? EventData,
    DateTime CreatedAt);

public record PublicInspectionDto(
    int InspectionId,
    string? InspectorName,
    string Result,
    string? Notes,
    DateTime CreatedAt);

public record PublicCertificateDto(
    int CertificateId,
    string CertificateType,
    string FileUrl,
    DateTime IssuedAt);

public record PublicRecallDto(
    int RecallId,
    string Reason,
    string Severity,
    DateTime CreatedAt,
    string Status);

// ─── Lineage DTOs ─────────────────────────────────────────────────

public record LineageDto(
    IReadOnlyList<LineageNodeDto> Nodes,
    IReadOnlyList<LineageEdgeDto> Edges);

public record LineageNodeDto(
    int BatchId,
    string BatchCode,
    decimal Quantity);

public record LineageEdgeDto(
    int SourceBatchId,
    int TargetBatchId,
    string RelationType);
