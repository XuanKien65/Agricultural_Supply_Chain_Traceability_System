using AgriTrace.Application.Common.Exceptions;
using AgriTrace.Domain.Contracts;
using AgriTrace.Domain.Interfaces;
using MediatR;

namespace AgriTrace.Application.Features.PublicTrace.Handlers;

public sealed class GetPublicTraceHandler(
    IPublicTraceRepository repo,
    ICacheService cache)
    : IRequestHandler<GetPublicTraceQuery, PublicTraceDto>
{
    private static readonly TimeSpan CacheTtl = TimeSpan.FromMinutes(5);

    public async Task<PublicTraceDto> Handle(GetPublicTraceQuery request, CancellationToken ct)
    {
        var cacheKey = $"trace:batch:{request.BatchId}";

        // 1. Kiểm tra cache
        var cached = await cache.GetAsync<PublicTraceDto>(cacheKey, ct);
        if (cached is not null) return cached;

        // 2. Cache miss -> Truy vấn DB
        var result = await repo.GetPublicTraceAsync(request.BatchId, ct);
        if (result is null)
            throw new NotFoundException($"Không tìm thấy dữ liệu truy xuất nguồn gốc cho lô hàng ID = {request.BatchId}");

        // 3. Lưu vào Cache TTL 5 phút
        await cache.SetAsync(cacheKey, result, CacheTtl, ct);

        return result;
    }
}

public sealed class GetBatchLineageHandler(
    IPublicTraceRepository repo,
    ICacheService cache)
    : IRequestHandler<GetBatchLineageQuery, LineageDto>
{
    private static readonly TimeSpan CacheTtl = TimeSpan.FromMinutes(5);

    public async Task<LineageDto> Handle(GetBatchLineageQuery request, CancellationToken ct)
    {
        var cacheKey = $"trace:lineage:{request.BatchId}";

        var cached = await cache.GetAsync<LineageDto>(cacheKey, ct);
        if (cached is not null) return cached;

        var result = await repo.GetLineageAsync(request.BatchId, ct);
        if (result is null)
            throw new NotFoundException($"Không tìm thấy phả hệ cho lô hàng ID = {request.BatchId}");

        await cache.SetAsync(cacheKey, result, CacheTtl, ct);

        return result;
    }
}
