namespace AgriTrace.Domain.Contracts;

/// <summary>Kết quả tra cứu công khai cho Người tiêu dùng (Consumer).</summary>
public record TraceResultDto(
    TraceBatchInfo Batch,
    IReadOnlyList<TraceEventDto> Events,
    IReadOnlyList<TraceInspectionDto> Inspections,
    IReadOnlyList<TraceCertificateDto> Certificates,
    bool HashChainValid);

public record TraceBatchInfo(
    int Id,
    string ProductName,
    string? ProductUnit,
    string ProducerOrganizationName,
    string QrCode,
    DateOnly? HarvestDate,
    decimal Weight,
    string Status,
    DateTime CreatedAt);

public record TraceEventDto(
    int Id,
    string EventType,
    DateTime EventTime,
    string? OrganizationName,
    string? PerformedByUserName,
    string? Location,
    string? AdditionalData,
    string? PreviousHash,
    string CurrentHash);

public record TraceInspectionDto(
    int Id,
    string? InspectorOrganizationName,
    string? Result,
    DateTime? InspectionDate,
    string? Notes);

public record TraceCertificateDto(
    int Id,
    string? CertificateType,
    string? IssuingOrganization,
    string? FileUrl,
    DateTime? IssuedDate,
    DateTime? ExpirationDate);
