using AgriTrace.Application.Contracts;
using AgriTrace.Application.Common.Exceptions;
using AgriTrace.Domain.Common;
using AgriTrace.Domain.Entities;
using AgriTrace.Domain.Interfaces;
using MediatR;
using System.Security.Cryptography;
using System.Text;

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

        // Compute SHA-256 CurrentHash based on canonical event data
        string ComputeEventHash()
        {
            var sb = new StringBuilder();
            sb.Append(batch.Id).Append('|');
            sb.Append(eventType).Append('|');
            sb.Append(request.OrganizationId).Append('|');
            sb.Append(request.PerformedByUserId).Append('|');
            sb.Append(HashCanonical.Timestamp(eventTime)).Append('|');
            sb.Append(request.AdditionalData ?? string.Empty).Append('|');
            sb.Append(request.Location ?? string.Empty);

            var bytes = Encoding.UTF8.GetBytes(sb.ToString());
            var hash = SHA256.HashData(bytes);
            return Convert.ToHexString(hash);
        }

        var currentHash = ComputeEventHash();

        var newEvent = new SupplyChainEvent(0, batch.Id, eventType, request.OrganizationId,
            request.PerformedByUserId, request.AdditionalData, request.Location, prevHash, currentHash, eventTime);

        var saved = await batches.AppendEventAsync(batch, newEvent, cancellationToken);
        return new(saved.Id, saved.EventType, saved.CreatedAt, saved.Location, saved.EventData, saved.PreviousHash, saved.CurrentHash ?? string.Empty);
    }
}
