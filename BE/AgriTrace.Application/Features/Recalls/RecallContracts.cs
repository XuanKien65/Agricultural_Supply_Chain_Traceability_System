using AgriTrace.Domain.Contracts;
using MediatR;

namespace AgriTrace.Application.Features.Recalls.Queries;

// ─── Queries ─────────────────────────────────────────────────────
public record GetRecallNotificationsForOrgQuery(int OrganizationId) : IRequest<IReadOnlyList<RecallNotificationDto>>;
public record GetRecallDetailQuery(int RecallId) : IRequest<RecallDetailDto>;

// ─── Commands ────────────────────────────────────────────────────
public record AcknowledgeRecallNotificationCommand(int NotificationId, string? ProcessingNotes) : IRequest;
