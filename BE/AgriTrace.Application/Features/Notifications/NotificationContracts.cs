using AgriTrace.Domain.Contracts;
using MediatR;

namespace AgriTrace.Application.Features.Notifications;

public record GetNotificationsQuery(int UserId) : IRequest<IReadOnlyList<NotificationDto>>;

public record GetUnreadCountQuery(int UserId) : IRequest<UnreadCountDto>;

public record MarkNotificationReadCommand(int NotificationId, int UserId) : IRequest;

public record MarkAllNotificationsReadCommand(int UserId) : IRequest;
