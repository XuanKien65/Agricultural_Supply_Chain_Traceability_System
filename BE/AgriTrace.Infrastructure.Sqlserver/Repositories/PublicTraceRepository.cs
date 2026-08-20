using AgriTrace.Domain.Contracts;
using AgriTrace.Domain.Interfaces;
using AgriTrace.Infrastructure.Sqlserver.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AgriTrace.Infrastructure.Sqlserver.Repositories;

public sealed class PublicTraceRepository(ApplicationDbContext db) : IPublicTraceRepository
{
    public async Task<PublicTraceDto?> GetPublicTraceAsync(int batchId, CancellationToken ct = default)
    {
        var batch = await db.Batches
            .AsNoTracking()
            .Include(b => b.Product)
            .Include(b => b.CurrentOrganization)
            .FirstOrDefaultAsync(b => b.Id == batchId, ct);

        if (batch is null) return null;

        var batchDto = new PublicBatchDto(
            batch.Id,
            batch.BatchCode,
            batch.Product?.Name ?? "Sản phẩm",
            batch.Product?.Category,
            batch.Quantity,
            batch.CurrentOrganization?.Name,
            batch.QRCode ?? $"https://agritrace.vn/trace/{batch.Id}",
            batch.CreatedAt);

        var events = await db.SupplyChainEvents
            .AsNoTracking()
            .Include(e => e.Organization)
            .Where(e => e.BatchId == batchId)
            .OrderBy(e => e.CreatedAt)
            .Select(e => new PublicEventDto(
                e.EventType,
                e.Organization != null ? e.Organization.Name : null,
                e.Location,
                e.EventData,
                e.CreatedAt))
            .ToListAsync(ct);

        var inspections = await db.Inspections
            .AsNoTracking()
            .Include(i => i.Inspector)
            .Where(i => i.BatchId == batchId)
            .OrderByDescending(i => i.CreatedAt)
            .Select(i => new PublicInspectionDto(
                i.Id,
                i.Inspector != null ? i.Inspector.FullName : null,
                i.Result,
                i.Notes,
                i.CreatedAt))
            .ToListAsync(ct);

        var certificates = await db.Certificates
            .AsNoTracking()
            .Where(c => c.BatchId == batchId)
            .OrderByDescending(c => c.IssuedAt)
            .Select(c => new PublicCertificateDto(
                c.Id,
                c.CertificateType,
                c.FileUrl,
                c.IssuedAt))
            .ToListAsync(ct);

        var recalls = await db.Recalls
            .AsNoTracking()
            .Where(r => r.BatchId == batchId)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new PublicRecallDto(
                r.Id,
                r.Reason ?? string.Empty,
                r.Severity ?? "MEDIUM",
                r.CreatedAt,
                r.Status ?? "ACTIVE"))
            .ToListAsync(ct);

        return new PublicTraceDto(batchDto, events, inspections, certificates, recalls);
    }

    public async Task<LineageDto?> GetLineageAsync(int batchId, CancellationToken ct = default)
    {
        var targetBatch = await db.Batches.AsNoTracking().FirstOrDefaultAsync(b => b.Id == batchId, ct);
        if (targetBatch is null) return null;

        var visitedBatchIds = new HashSet<int> { batchId };
        var queue = new Queue<int>();
        queue.Enqueue(batchId);

        var edges = new List<LineageEdgeDto>();

        // BFS traversal qua BatchRelations và ParentBatchId
        while (queue.Count > 0)
        {
            var currentId = queue.Dequeue();

            // Tìm quan hệ mà currentId là Target (lô cha/nguồn)
            var parentRels = await db.BatchRelations
                .AsNoTracking()
                .Where(r => r.TargetBatchId == currentId)
                .ToListAsync(ct);

            foreach (var rel in parentRels)
            {
                edges.Add(new LineageEdgeDto(rel.SourceBatchId, rel.TargetBatchId, rel.RelationType ?? "SPLIT"));
                if (visitedBatchIds.Add(rel.SourceBatchId))
                {
                    queue.Enqueue(rel.SourceBatchId);
                }
            }

            // Tìm quan hệ mà currentId là Source (lô con/đích)
            var childRels = await db.BatchRelations
                .AsNoTracking()
                .Where(r => r.SourceBatchId == currentId)
                .ToListAsync(ct);

            foreach (var rel in childRels)
            {
                edges.Add(new LineageEdgeDto(rel.SourceBatchId, rel.TargetBatchId, rel.RelationType ?? "SPLIT"));
                if (visitedBatchIds.Add(rel.TargetBatchId))
                {
                    queue.Enqueue(rel.TargetBatchId);
                }
            }

            // Kiểm tra ParentBatchId của lô
            var b = await db.Batches.AsNoTracking().FirstOrDefaultAsync(x => x.Id == currentId, ct);
            if (b?.ParentBatchId.HasValue == true)
            {
                var parentId = b.ParentBatchId.Value;
                if (!edges.Any(e => e.SourceBatchId == parentId && e.TargetBatchId == currentId))
                {
                    edges.Add(new LineageEdgeDto(parentId, currentId, "SPLIT"));
                }
                if (visitedBatchIds.Add(parentId))
                {
                    queue.Enqueue(parentId);
                }
            }
        }

        // Lấy thông tin các Nodes
        var nodes = await db.Batches
            .AsNoTracking()
            .Where(b => visitedBatchIds.Contains(b.Id))
            .OrderBy(b => b.Id)
            .Select(b => new LineageNodeDto(
                b.Id,
                b.BatchCode,
                b.Quantity))
            .ToListAsync(ct);

        // Deduplicate edges
        var distinctEdges = edges
            .GroupBy(e => (e.SourceBatchId, e.TargetBatchId, e.RelationType))
            .Select(g => g.First())
            .ToList();

        return new LineageDto(nodes, distinctEdges);
    }
}
