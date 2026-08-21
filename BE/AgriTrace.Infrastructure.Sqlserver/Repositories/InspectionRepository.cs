using System.Security.Cryptography;
using System.Text;
using AgriTrace.Domain.Common;
using AgriTrace.Domain.Contracts;
using AgriTrace.Domain.Interfaces;
using AgriTrace.Infrastructure.Sqlserver.Models;
using AgriTrace.Infrastructure.Sqlserver.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AgriTrace.Infrastructure.Sqlserver.Repositories;

public sealed class InspectionRepository(ApplicationDbContext db) : IInspectionRepository
{
    public async Task<IReadOnlyList<InspectionDto>> GetByBatchAsync(int batchId, CancellationToken ct = default)
    {
        var items = await db.Inspections
            .AsNoTracking()
            .Include(i => i.Inspector)
            .Where(i => i.BatchId == batchId)
            .OrderByDescending(i => i.CreatedAt)
            .Select(i => new InspectionDto(
                i.Id,
                i.BatchId,
                i.InspectorId,
                i.Inspector != null ? i.Inspector.FullName : null,
                i.Result,
                i.Notes,
                i.CreatedAt))
            .ToListAsync(ct);

        return items;
    }

    public async Task<InspectionDto?> GetByIdAsync(int inspectionId, CancellationToken ct = default)
    {
        var item = await db.Inspections
            .AsNoTracking()
            .Include(i => i.Inspector)
            .FirstOrDefaultAsync(i => i.Id == inspectionId, ct);

        if (item is null) return null;

        return new InspectionDto(
            item.Id,
            item.BatchId,
            item.InspectorId,
            item.Inspector != null ? item.Inspector.FullName : null,
            item.Result,
            item.Notes,
            item.CreatedAt);
    }

    public async Task<InspectionDto> CreateAsync(int batchId, int inspectorId, string result, string? notes, CancellationToken ct = default)
    {
        var batch = await db.Batches.FirstOrDefaultAsync(b => b.Id == batchId, ct)
            ?? throw new KeyNotFoundException($"Không tìm thấy lô hàng với ID = {batchId}");

        var inspector = await db.Users.FirstOrDefaultAsync(u => u.Id == inspectorId, ct)
            ?? throw new KeyNotFoundException($"Không tìm thấy kiểm định viên với ID = {inspectorId}");

        var now = DateTime.UtcNow;

        // 1. Tạo Inspection
        var inspection = new InspectionDataModel
        {
            BatchId = batchId,
            InspectorId = inspectorId,
            Result = result.Trim().ToUpperInvariant(),
            Notes = notes,
            CreatedAt = now
        };

        db.Inspections.Add(inspection);
        await db.SaveChangesAsync(ct);

        // 2. Tự động ghi event INSPECT vào SupplyChainEvents
        var lastEvent = await db.SupplyChainEvents
            .Where(e => e.BatchId == batchId)
            .OrderByDescending(e => e.CreatedAt)
            .ThenByDescending(e => e.Id)
            .FirstOrDefaultAsync(ct);

        var prevHash = lastEvent?.CurrentHash;
        var rawData = $"{prevHash}|{batchId}|INSPECT|{inspector.OrganizationId ?? batch.CurrentOrganizationId ?? 0}|{inspectorId}|{HashCanonical.Timestamp(now)}|{notes}";
        var currentHash = ComputeSha256Hash(rawData);

        var chainEvent = new SupplyChainEventDataModel
        {
            BatchId = batchId,
            EventType = "INSPECT",
            OrganizationId = inspector.OrganizationId ?? batch.CurrentOrganizationId ?? 1,
            UserId = inspectorId,
            EventData = string.IsNullOrWhiteSpace(notes) ? $"{{\"result\":\"{result}\"}}" : $"{{\"result\":\"{result}\",\"notes\":\"{notes}\"}}",
            Location = "Phòng Kiểm định",
            PreviousHash = prevHash,
            CurrentHash = currentHash,
            CreatedAt = now
        };

        db.SupplyChainEvents.Add(chainEvent);
        await db.SaveChangesAsync(ct);

        return new InspectionDto(
            inspection.Id,
            inspection.BatchId,
            inspection.InspectorId,
            inspector.FullName,
            inspection.Result,
            inspection.Notes,
            inspection.CreatedAt);
    }

    private static string ComputeSha256Hash(string rawData)
    {
        using var sha256 = SHA256.Create();
        var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(rawData));
        var builder = new StringBuilder();
        foreach (var b in bytes) builder.Append(b.ToString("x2"));
        return builder.ToString();
    }
}
