using AgriTrace.Application.Contracts;
using AgriTrace.Application.Common.Exceptions;
using AgriTrace.Domain.Interfaces;
using MediatR;

namespace AgriTrace.Application.Features.Events.Commands;

public record AppendSupplyChainEventCommand(int BatchId, int OrganizationId, int PerformedByUserId,
    string EventType, DateTime? EventTime, string? Location, string? AdditionalData) : IRequest<BatchEventDto>;

public sealed class AppendSupplyChainEventCommandHandler(IBatchRepository batches, IUserRepository users)
    : IRequestHandler<AppendSupplyChainEventCommand, BatchEventDto>
{
    public async Task<BatchEventDto> Handle(AppendSupplyChainEventCommand request, CancellationToken cancellationToken)
    {
        var batch = await batches.GetByIdAsync(request.BatchId, cancellationToken) ?? throw new NotFoundException("Không tìm thấy lô hàng.");

        var performerOrganizationId = await users.GetOrganizationIdAsync(request.PerformedByUserId, cancellationToken);
        if (performerOrganizationId != request.OrganizationId)
            throw new ForbiddenException("Người thực hiện không thuộc đơn vị thực hiện.");

        var eventType = request.EventType.Trim().ToUpperInvariant();
        var eventTime = request.EventTime ?? DateTime.UtcNow;
        var appended = batch.AppendEvent(eventType, request.OrganizationId, request.PerformedByUserId, eventTime, request.Location, request.AdditionalData);
        var saved = await batches.AppendEventAsync(batch, appended, cancellationToken);
        return new(saved.Id, saved.EventType, saved.EventTime, saved.Location, saved.AdditionalData, saved.PreviousHash, saved.Hash);
    }
}
