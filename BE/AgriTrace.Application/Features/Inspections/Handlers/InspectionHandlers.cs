using AgriTrace.Application.Common.Exceptions;
using AgriTrace.Domain.Contracts;
using AgriTrace.Domain.Interfaces;
using MediatR;

namespace AgriTrace.Application.Features.Inspections.Handlers;

public sealed class GetInspectionsByBatchHandler(IInspectionRepository repo)
    : IRequestHandler<GetInspectionsByBatchQuery, IReadOnlyList<InspectionDto>>
{
    public Task<IReadOnlyList<InspectionDto>> Handle(GetInspectionsByBatchQuery request, CancellationToken ct) =>
        repo.GetByBatchAsync(request.BatchId, ct);
}

public sealed class GetInspectionByIdHandler(IInspectionRepository repo)
    : IRequestHandler<GetInspectionByIdQuery, InspectionDto>
{
    public async Task<InspectionDto> Handle(GetInspectionByIdQuery request, CancellationToken ct)
    {
        var item = await repo.GetByIdAsync(request.InspectionId, ct);
        if (item is null) throw new NotFoundException($"Không tìm thấy phiếu kiểm định với ID = {request.InspectionId}");
        return item;
    }
}

public sealed class CreateInspectionHandler(
    IInspectionRepository repo,
    ICacheService cache)
    : IRequestHandler<CreateInspectionCommand, InspectionDto>
{
    public async Task<InspectionDto> Handle(CreateInspectionCommand request, CancellationToken ct)
    {
        var created = await repo.CreateAsync(request.BatchId, request.InspectorId, request.Result, request.Notes, ct);

        // Invalidate public trace cache
        await cache.RemoveAsync($"trace:batch:{request.BatchId}", ct);

        return created;
    }
}
