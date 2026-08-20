using AgriTrace.Domain.Common;
using AgriTrace.Domain.Contracts;
using AgriTrace.Domain.Interfaces;
using MediatR;

namespace AgriTrace.Application.Features.Recalls.Handlers;

public sealed class GetRecallsHandler(IRecallRepository repo)
    : IRequestHandler<GetRecallsQuery, PagedResult<RecallDto>>
{
    public Task<PagedResult<RecallDto>> Handle(GetRecallsQuery request, CancellationToken ct) =>
        repo.GetAllAsync(request.Page, request.PageSize, ct);
}

public sealed class CreateRecallHandler(
    IRecallRepository repo,
    ICacheService cache)
    : IRequestHandler<CreateRecallCommand, RecallDto>
{
    public async Task<RecallDto> Handle(CreateRecallCommand request, CancellationToken ct)
    {
        var created = await repo.CreateAsync(request.BatchId, request.Reason, request.Severity, request.CreatedBy, ct);

        // Invalidate public trace cache for this batch
        await cache.RemoveAsync($"trace:batch:{request.BatchId}", ct);

        return created;
    }
}

public sealed class ResolveRecallHandler(
    IRecallRepository repo,
    ICacheService cache)
    : IRequestHandler<ResolveRecallCommand, RecallDto>
{
    public async Task<RecallDto> Handle(ResolveRecallCommand request, CancellationToken ct)
    {
        var resolved = await repo.ResolveAsync(request.RecallId, request.ResolvedBy, ct);

        // Invalidate public trace cache for this batch
        await cache.RemoveAsync($"trace:batch:{resolved.BatchId}", ct);

        return resolved;
    }
}
