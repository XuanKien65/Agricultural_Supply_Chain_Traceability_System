namespace AgriTrace.Domain.Contracts;

// ─── DTOs ────────────────────────────────────────────────────────
public record RecallNotificationDto(
    int Id,
    int RecallId,
    int OrganizationId,
    string? OrganizationName,
    DateTime SentAt,
    string AcknowledgementStatus,
    string? ProcessingNotes);

public record RecallDetailDto(
    int Id,
    int BatchId,
    string? BatchCode,
    string? Reason,
    string? Severity,
    string? CreatedByName,
    DateTime CreatedAt,
    string Status,
    IReadOnlyList<RecallNotificationDto> Notifications);
