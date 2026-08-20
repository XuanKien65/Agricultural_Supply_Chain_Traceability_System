using AgriTrace.Domain.Contracts;
using MediatR;

namespace AgriTrace.Application.Features.PublicTrace;

public record GetPublicTraceQuery(string BatchId) : IRequest<PublicTraceDto>;

public record GetBatchLineageQuery(string BatchId) : IRequest<LineageDto>;
