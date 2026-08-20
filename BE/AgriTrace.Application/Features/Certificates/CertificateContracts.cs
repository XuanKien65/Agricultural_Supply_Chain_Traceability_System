using AgriTrace.Domain.Contracts;
using MediatR;

namespace AgriTrace.Application.Features.Certificates;

public record GetCertificatesByBatchQuery(int BatchId) : IRequest<IReadOnlyList<CertificateDto>>;

public record CreateCertificateCommand(
    int BatchId,
    int? InspectionId,
    string CertificateType,
    string FileUrl) : IRequest<CertificateDto>;
