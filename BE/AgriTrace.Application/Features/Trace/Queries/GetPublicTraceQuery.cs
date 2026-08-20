using AgriTrace.Application.Common.Exceptions;
using AgriTrace.Domain.Contracts;
using AgriTrace.Domain.Entities;
using AgriTrace.Domain.Interfaces;
using MediatR;

namespace AgriTrace.Application.Features.Trace.Queries;

/// <summary>Tra cứu công khai lô hàng theo BatchId — Không yêu cầu xác thực.</summary>
public record GetPublicTraceQuery(int BatchId) : IRequest<TraceResultDto>;

public sealed class GetPublicTraceQueryHandler(IBatchRepository batches)
    : IRequestHandler<GetPublicTraceQuery, TraceResultDto>
{
    public async Task<TraceResultDto> Handle(GetPublicTraceQuery request, CancellationToken ct)
    {
        var result = await batches.GetByIdWithFullTraceAsync(request.BatchId, ct)
            ?? throw new NotFoundException("Không tìm thấy lô hàng với mã này.");

        return result;
    }
}
