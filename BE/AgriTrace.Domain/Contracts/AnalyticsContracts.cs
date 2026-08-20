namespace AgriTrace.Domain.Contracts;

// ─── Analytics / Dashboard DTOs ───────────────────────────────────

/// <summary>Tổng quan toàn hệ thống (ADMIN only).</summary>
public record OverviewDto(
    int TotalOrganizations,
    int TotalUsers,
    int TotalBatches,
    int TotalEvents,
    int TotalInspections,
    int TotalCertificates,
    int TotalRecalls,
    int ActiveRecalls);

/// <summary>Phân bổ lô hàng theo tổ chức.</summary>
public record BatchDistributionDto(
    IReadOnlyList<BatchDistributionItemDto> Items);

public record BatchDistributionItemDto(
    int OrganizationId,
    string OrganizationName,
    string OrganizationType,
    int BatchCount,
    decimal TotalQuantity);

/// <summary>Thời gian xử lý trung bình giữa các bước trong chuỗi.</summary>
public record ProcessingTimeDto(
    IReadOnlyList<ProcessingTimeItemDto> Items);

public record ProcessingTimeItemDto(
    string FromEventType,
    string ToEventType,
    double AverageHours,
    int SampleCount);

/// <summary>Truy vết ngược: từ lô hàng hiện tại tìm nguồn gốc.</summary>
public record TracebackDto(
    int TargetBatchId,
    string TargetBatchCode,
    IReadOnlyList<TracebackNodeDto> Ancestors,
    IReadOnlyList<TracebackEventDto> Timeline);

public record TracebackNodeDto(
    int BatchId,
    string BatchCode,
    decimal Quantity,
    string? OrganizationName,
    DateTime CreatedAt,
    int Depth);

public record TracebackEventDto(
    int BatchId,
    string BatchCode,
    string EventType,
    string? OrganizationName,
    string? Location,
    DateTime CreatedAt);
