using AgriTrace.Domain.Contracts;
using AgriTrace.Domain.Interfaces;
using MediatR;

namespace AgriTrace.Application.Features.Certificates.Handlers;

public sealed class GetCertificatesByBatchHandler(ICertificateRepository repo)
    : IRequestHandler<GetCertificatesByBatchQuery, IReadOnlyList<CertificateDto>>
{
    public Task<IReadOnlyList<CertificateDto>> Handle(GetCertificatesByBatchQuery request, CancellationToken ct) =>
        repo.GetByBatchAsync(request.BatchId, ct);
}

public sealed class CreateCertificateHandler(
    ICertificateRepository repo,
    ICacheService cache)
    : IRequestHandler<CreateCertificateCommand, CertificateDto>
{
    public async Task<CertificateDto> Handle(CreateCertificateCommand request, CancellationToken ct)
    {
        var created = await repo.CreateAsync(request.BatchId, request.InspectionId, request.CertificateType, request.FileUrl, ct);

        // Invalidate public trace cache
        await cache.RemoveAsync($"trace:batch:{request.BatchId}", ct);

        return created;
    }
}
