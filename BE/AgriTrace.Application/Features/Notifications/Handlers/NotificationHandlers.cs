using AgriTrace.Domain.Contracts;
using AgriTrace.Domain.Interfaces;
using MediatR;

namespace AgriTrace.Application.Features.Notifications.Handlers;

public sealed class GetNotificationsHandler(INotificationRepository repo)
    : IRequestHandler<GetNotificationsQuery, IReadOnlyList<NotificationDto>>
{
    public Task<IReadOnlyList<NotificationDto>> Handle(GetNotificationsQuery request, CancellationToken ct) =>
        repo.GetByUserAsync(request.UserId, ct);
}

public sealed class GetUnreadCountHandler(INotificationRepository repo)
    : IRequestHandler<GetUnreadCountQuery, UnreadCountDto>
{
    public async Task<UnreadCountDto> Handle(GetUnreadCountQuery request, CancellationToken ct)
    {
        var count = await repo.GetUnreadCountAsync(request.UserId, ct);
        return new UnreadCountDto(count);
    }
}

public sealed class MarkNotificationReadHandler(INotificationRepository repo)
    : IRequestHandler<MarkNotificationReadCommand>
{
    public Task Handle(MarkNotificationReadCommand request, CancellationToken ct) =>
        repo.MarkReadAsync(request.NotificationId, request.UserId, ct);
}

public sealed class MarkAllNotificationsReadHandler(INotificationRepository repo)
    : IRequestHandler<MarkAllNotificationsReadCommand>
{
    public Task Handle(MarkAllNotificationsReadCommand request, CancellationToken ct) =>
        repo.MarkAllReadAsync(request.UserId, ct);
}
