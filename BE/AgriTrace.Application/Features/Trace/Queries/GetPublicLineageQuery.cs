using AgriTrace.Domain.Contracts;
using AgriTrace.Domain.Interfaces;
using MediatR;

namespace AgriTrace.Application.Features.Trace.Queries;

public record GetPublicLineageQuery(string BatchId) : IRequest<LineageResult>;

public sealed class GetPublicLineageQueryHandler(IBatchRepository batches)
    : IRequestHandler<GetPublicLineageQuery, LineageResult>
{
    public async Task<LineageResult> Handle(GetPublicLineageQuery request, CancellationToken ct)
    {
        var result = await batches.GetLineageAsync(request.BatchId, ct);
        if (result is null) throw new AgriTrace.Application.Common.Exceptions.NotFoundException("Không tìm thấy phả hệ lô hàng.");
        return result;
    }
}
