using AgriTrace.Application.Contracts;
using AgriTrace.Application.Common.Exceptions;
using AgriTrace.Domain.Entities;
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
        var batch = await batches.GetByIdAsync(request.BatchId, cancellationToken)
            ?? throw new NotFoundException("Không tìm thấy lô hàng.");

        var user = await users.GetByIdAsync(request.PerformedByUserId, cancellationToken);
        if (user is null || user.OrganizationId != request.OrganizationId)
            throw new ForbiddenException("Người thực hiện không thuộc đơn vị thực hiện.");

        var eventType = request.EventType.Trim().ToUpperInvariant();
        var eventTime = request.EventTime ?? DateTime.UtcNow;

        var lastEvent = batch.Events.OrderBy(e => e.CreatedAt).LastOrDefault();
        var prevHash = lastEvent?.CurrentHash;
        var currentHash = Guid.NewGuid().ToString("N");

        var newEvent = new SupplyChainEvent(0, batch.Id, eventType, request.OrganizationId,
            request.PerformedByUserId, request.AdditionalData, request.Location, prevHash, currentHash, eventTime);

        var saved = await batches.AppendEventAsync(batch, newEvent, cancellationToken);
        return new(saved.Id, saved.EventType, saved.CreatedAt, saved.Location, saved.EventData, saved.PreviousHash, saved.CurrentHash ?? string.Empty);
    }
}
