using AgriTrace.Domain.Contracts;
using AgriTrace.Domain.Interfaces;
using AgriTrace.Infrastructure.Sqlserver.Models;
using AgriTrace.Infrastructure.Sqlserver.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AgriTrace.Infrastructure.Sqlserver.Repositories;

public sealed class CertificateRepository(ApplicationDbContext db) : ICertificateRepository
{
    public async Task<IReadOnlyList<CertificateDto>> GetByBatchAsync(int batchId, CancellationToken ct = default)
    {
        var items = await db.Certificates
            .AsNoTracking()
            .Where(c => c.BatchId == batchId)
            .OrderByDescending(c => c.IssuedAt)
            .Select(c => new CertificateDto(
                c.Id,
                c.BatchId,
                c.InspectionId,
                c.CertificateType,
                c.FileUrl,
                c.IssuedAt))
            .ToListAsync(ct);

        return items;
    }

    public async Task<CertificateDto> CreateAsync(int batchId, int? inspectionId, string certificateType, string fileUrl, CancellationToken ct = default)
    {
        var batch = await db.Batches.FirstOrDefaultAsync(b => b.Id == batchId, ct)
            ?? throw new KeyNotFoundException($"Không tìm thấy lô hàng với ID = {batchId}");

        if (inspectionId.HasValue)
        {
            var inspection = await db.Inspections.FirstOrDefaultAsync(i => i.Id == inspectionId.Value, ct)
                ?? throw new KeyNotFoundException($"Không tìm thấy phiếu kiểm định với ID = {inspectionId.Value}");
        }

        var certificate = new CertificateDataModel
        {
            BatchId = batchId,
            InspectionId = inspectionId,
            CertificateType = certificateType.Trim(),
            FileUrl = fileUrl.Trim(),
            IssuedAt = DateTime.UtcNow
        };

        db.Certificates.Add(certificate);
        await db.SaveChangesAsync(ct);

        return new CertificateDto(
            certificate.Id,
            certificate.BatchId,
            certificate.InspectionId,
            certificate.CertificateType,
            certificate.FileUrl,
            certificate.IssuedAt);
    }
}
