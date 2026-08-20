using AgriTrace.Application.Common.Exceptions;
using AgriTrace.Domain.Interfaces;
using MediatR;

namespace AgriTrace.Application.Features.Batches.Queries;

public record VerifyHashChainQuery(int BatchId) : IRequest<HashChainVerificationResult>;

public record HashChainVerificationResult(
    int BatchId,
    bool IsValid,
    int TotalEvents,
    int? BrokenAtEventIndex,
    string? BrokenAtEventType,
    string Message);

public sealed class VerifyHashChainQueryHandler(IBatchRepository batches)
    : IRequestHandler<VerifyHashChainQuery, HashChainVerificationResult>
{
    public async Task<HashChainVerificationResult> Handle(VerifyHashChainQuery request, CancellationToken ct)
    {
        var batch = await batches.GetByIdAsync(request.BatchId, ct)
            ?? throw new NotFoundException("Không tìm thấy lô hàng.");

        var events = batch.Events.OrderBy(e => e.CreatedAt).ToList();

        if (events.Count == 0)
            return new(request.BatchId, true, 0, null, null, "Lô hàng chưa có sự kiện.");

        for (int i = 0; i < events.Count; i++)
        {
            var e = events[i];
            if (i > 0 && e.PreviousHash != events[i - 1].CurrentHash)
            {
                return new(request.BatchId, false, events.Count, i, e.EventType,
                    $"Chuỗi hash bị gãy tại sự kiện #{i + 1} ({e.EventType}). PreviousHash không khớp.");
            }
        }

        return new(request.BatchId, true, events.Count, null, null,
            $"Chuỗi hash toàn vẹn — {events.Count} sự kiện đã được xác minh.");
    }
}
