using AgriTrace.Application.Common.Exceptions;
using AgriTrace.Domain.Interfaces;
using MediatR;
using System.Security.Cryptography;
using System.Text;

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

            // Verify PreviousHash matches previous event's CurrentHash (if not first)
            if (i > 0 && e.PreviousHash != events[i - 1].CurrentHash)
            {
                return new(request.BatchId, false, events.Count, i, e.EventType,
                    $"Chuỗi hash bị gãy tại sự kiện #{i + 1} ({e.EventType}). PreviousHash không khớp.");
            }

            // Recompute expected CurrentHash from canonical event data
            string ComputeExpectedHash()
            {
                var sb = new StringBuilder();
                sb.Append(e.BatchId).Append('|');
                sb.Append(e.EventType).Append('|');
                sb.Append(e.OrganizationId).Append('|');
                sb.Append(e.UserId).Append('|');
                sb.Append(e.CreatedAt.ToString("O")).Append('|');
                sb.Append(e.EventData ?? string.Empty).Append('|');
                sb.Append(e.Location ?? string.Empty);

                var bytes = Encoding.UTF8.GetBytes(sb.ToString());
                var hash = SHA256.HashData(bytes);
                return Convert.ToHexString(hash);
            }

            var expected = ComputeExpectedHash();
            if (!string.Equals(expected, e.CurrentHash, StringComparison.OrdinalIgnoreCase))
            {
                return new(request.BatchId, false, events.Count, i, e.EventType,
                    $"Chuỗi hash bị gãy tại sự kiện #{i + 1} ({e.EventType}). CurrentHash không khớp (dữ liệu có dấu hiệu bị sửa đổi).");
            }
        }

        return new(request.BatchId, true, events.Count, null, null,
            $"Chuỗi hash toàn vẹn — {events.Count} sự kiện đã được xác minh.");
    }
}
