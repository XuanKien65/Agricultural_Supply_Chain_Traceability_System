using AgriTrace.Domain.Common;
using AgriTrace.Domain.Contracts;
using MediatR;

namespace AgriTrace.Application.Features.Recalls;

public record GetRecallsQuery(int Page = 1, int PageSize = 20) : IRequest<PagedResult<RecallDto>>;

public record CreateRecallCommand(
    int BatchId,
    string Reason,
    string Severity,
    int CreatedBy) : IRequest<RecallDto>;

public record ResolveRecallCommand(
    int RecallId,
    int ResolvedBy) : IRequest<RecallDto>;
