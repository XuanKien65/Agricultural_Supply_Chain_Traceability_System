using AgriTrace.Application.Common.Exceptions;
using AgriTrace.Domain.Contracts;
using AgriTrace.Domain.Interfaces;
using MediatR;

namespace AgriTrace.Application.Features.Analytics.Handlers;

public sealed class GetOverviewAnalyticsHandler(IAnalyticsRepository repo)
    : IRequestHandler<GetOverviewAnalyticsQuery, OverviewDto>
{
    public Task<OverviewDto> Handle(GetOverviewAnalyticsQuery request, CancellationToken ct) =>
        repo.GetOverviewAsync(ct);
}

public sealed class GetBatchDistributionHandler(IAnalyticsRepository repo)
    : IRequestHandler<GetBatchDistributionQuery, BatchDistributionDto>
{
    public Task<BatchDistributionDto> Handle(GetBatchDistributionQuery request, CancellationToken ct) =>
        repo.GetBatchDistributionAsync(request.OrganizationId, ct);
}

public sealed class GetProcessingTimeHandler(IAnalyticsRepository repo)
    : IRequestHandler<GetProcessingTimeQuery, ProcessingTimeDto>
{
    public Task<ProcessingTimeDto> Handle(GetProcessingTimeQuery request, CancellationToken ct) =>
        repo.GetProcessingTimeAsync(request.OrganizationId, ct);
}

public sealed class GetTracebackHandler(IAnalyticsRepository repo)
    : IRequestHandler<GetTracebackQuery, TracebackDto>
{
    public async Task<TracebackDto> Handle(GetTracebackQuery request, CancellationToken ct)
    {
        var result = await repo.GetTracebackAsync(request.BatchId, ct);
        if (result is null)
            throw new NotFoundException($"Không tìm thấy lô hàng với ID = {request.BatchId} để truy vết ngược.");
        return result;
    }
}
