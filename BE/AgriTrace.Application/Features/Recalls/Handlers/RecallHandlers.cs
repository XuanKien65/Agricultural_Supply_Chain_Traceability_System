using AgriTrace.Application.Common.Exceptions;
using AgriTrace.Application.Features.Recalls.Queries;
using AgriTrace.Domain.Contracts;
using AgriTrace.Domain.Interfaces;
using MediatR;

namespace AgriTrace.Application.Features.Recalls.Handlers;

public sealed class GetRecallNotificationsForOrgHandler(IRecallNotificationRepository repo)
    : IRequestHandler<GetRecallNotificationsForOrgQuery, IReadOnlyList<RecallNotificationDto>>
{
    public Task<IReadOnlyList<RecallNotificationDto>> Handle(GetRecallNotificationsForOrgQuery request, CancellationToken ct)
        => repo.GetByOrganizationAsync(request.OrganizationId, ct);
}

public sealed class GetRecallDetailHandler(IRecallNotificationRepository repo)
    : IRequestHandler<GetRecallDetailQuery, RecallDetailDto>
{
    public async Task<RecallDetailDto> Handle(GetRecallDetailQuery request, CancellationToken ct)
        => await repo.GetRecallDetailAsync(request.RecallId, ct)
            ?? throw new NotFoundException("Không tìm thấy cảnh báo thu hồi.");
}

public sealed class AcknowledgeRecallNotificationHandler(IRecallNotificationRepository repo)
    : IRequestHandler<AcknowledgeRecallNotificationCommand>
{
    public Task Handle(AcknowledgeRecallNotificationCommand request, CancellationToken ct)
        => repo.AcknowledgeAsync(request.NotificationId, request.ProcessingNotes, ct);
}
