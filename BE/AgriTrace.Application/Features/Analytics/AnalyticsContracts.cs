using AgriTrace.Domain.Contracts;
using MediatR;

namespace AgriTrace.Application.Features.Analytics;

public record GetOverviewAnalyticsQuery : IRequest<OverviewDto>;

public record GetBatchDistributionQuery(int? OrganizationId = null) : IRequest<BatchDistributionDto>;

public record GetProcessingTimeQuery(int? OrganizationId = null) : IRequest<ProcessingTimeDto>;

public record GetTracebackQuery(int BatchId) : IRequest<TracebackDto>;
