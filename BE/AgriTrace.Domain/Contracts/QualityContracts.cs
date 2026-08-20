namespace AgriTrace.Domain.Contracts;

// ─── Inspection DTOs ──────────────────────────────────────────────

public record InspectionDto(
    int InspectionId,
    int BatchId,
    int InspectorId,
    string? InspectorName,
    string Result,
    string? Notes,
    DateTime CreatedAt);

// ─── Certificate DTOs ─────────────────────────────────────────────

public record CertificateDto(
    int CertificateId,
    int BatchId,
    int? InspectionId,
    string CertificateType,
    string FileUrl,
    DateTime IssuedAt);
