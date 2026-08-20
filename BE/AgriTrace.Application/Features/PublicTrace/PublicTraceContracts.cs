using AgriTrace.Domain.Contracts;
using MediatR;

namespace AgriTrace.Application.Features.PublicTrace;

public record GetPublicTraceQuery(int BatchId) : IRequest<PublicTraceDto>;

public record GetBatchLineageQuery(int BatchId) : IRequest<LineageDto>;
