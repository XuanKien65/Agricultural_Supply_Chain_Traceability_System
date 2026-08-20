using AgriTrace.Domain.Contracts;
using AgriTrace.Domain.Common;
using AgriTrace.Domain.Entities;
using AgriTrace.Domain.Interfaces;
using AgriTrace.Infrastructure.Sqlserver.Models;
using AgriTrace.Infrastructure.Sqlserver.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AgriTrace.Infrastructure.Sqlserver.Repositories;

public sealed class BatchRepository(ApplicationDbContext db) : IBatchRepository
{
    public async Task<PagedResult<Batch>> GetFarmerBatchesAsync(int organizationId, string? search, string? status, int page, int pageSize, CancellationToken ct = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = db.Batches
            .AsNoTracking()
            .Include(x => x.Events)
            .Where(x => x.CurrentOrganizationId == organizationId);

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(x => x.BatchCode.Contains(search) || (x.QRCode != null && x.QRCode.Contains(search)));

        var total = await query.CountAsync(ct);
        var rows = await query
            .OrderByDescending(x => x.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return new PagedResult<Batch>(rows.Select(Map).ToList(), total);
    }

    public async Task<Batch?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var row = await db.Batches
            .AsNoTracking()
            .Include(x => x.Events)
            .FirstOrDefaultAsync(x => x.Id == id, ct);

        return row is null ? null : Map(row);
    }

    public async Task<Batch> AddAsync(Batch batch, CancellationToken ct = default)
    {
        var row = new BatchDataModel
        {
            ProductId = batch.ProductId,
            BatchCode = batch.BatchCode,
            Quantity = batch.Quantity,
            CurrentOrganizationId = batch.CurrentOrganizationId,
            ParentBatchId = batch.ParentBatchId,
            RootBatchId = batch.RootBatchId,
            QRCode = batch.QrCode,
            CreatedAt = batch.CreatedAt
        };

        db.Batches.Add(row);
        await db.SaveChangesAsync(ct);

        if (string.IsNullOrEmpty(row.QRCode))
        {
            row.QRCode = $"https://agritrace.vn/trace/{row.Id}";
            await db.SaveChangesAsync(ct);
        }

        return Map(row);
    }

    public async Task<SupplyChainEvent> AppendEventAsync(Batch batch, SupplyChainEvent e, CancellationToken ct = default)
    {
        var row = new SupplyChainEventDataModel
        {
            BatchId = batch.Id,
            EventType = e.EventType,
            OrganizationId = e.OrganizationId,
            UserId = e.UserId,
            EventData = e.EventData,
            Location = e.Location,
            PreviousHash = e.PreviousHash,
            CurrentHash = e.CurrentHash,
            CreatedAt = e.CreatedAt
        };

        db.SupplyChainEvents.Add(row);
        await db.SaveChangesAsync(ct);

        return new SupplyChainEvent(row.Id, row.BatchId, row.EventType, row.OrganizationId, row.UserId,
            row.EventData, row.Location, row.PreviousHash, row.CurrentHash, row.CreatedAt);
    }

    public async Task<TraceResultDto?> GetByIdWithFullTraceAsync(string batchIdOrCode, CancellationToken ct = default)
    {
        var trimmed = batchIdOrCode.Trim();
        var conn = db.Database.GetDbConnection();
        await conn.OpenAsync(ct);

        TraceBatchInfo? batchInfo = null;
        using (var cmd = conn.CreateCommand())
        {
            cmd.CommandText = @"
                SELECT b.Id, p.Name AS ProductName, p.Unit AS ProductUnit, o.Name AS ProducerOrgName,
                       b.QRCode, NULL AS HarvestDate, b.Quantity, 'ACTIVE' AS Status, b.CreatedAt
                FROM Batches b
                JOIN Products p ON p.Id = b.ProductId
                LEFT JOIN Organizations o ON o.Id = b.CurrentOrganizationId
                WHERE b.BatchCode = @code 
                   OR (TRY_CAST(@code AS INT) IS NOT NULL AND b.Id = TRY_CAST(@code AS INT))
                   OR (b.QRCode IS NOT NULL AND b.QRCode LIKE '%' + @code + '%')";
            var p = cmd.CreateParameter(); p.ParameterName = "@code"; p.Value = trimmed;
            cmd.Parameters.Add(p);
            using var reader = await cmd.ExecuteReaderAsync(ct);
            if (await reader.ReadAsync(ct))
            {
                var resolvedId = reader.GetInt32(0);
                batchInfo = new TraceBatchInfo(
                    resolvedId,
                    reader.GetString(1),
                    reader.IsDBNull(2) ? null : reader.GetString(2),
                    reader.IsDBNull(3) ? "Tổ chức sản xuất" : reader.GetString(3),
                    reader.IsDBNull(4) ? $"https://agritrace.vn/trace/{resolvedId}" : reader.GetString(4),
                    null,
                    reader.GetDecimal(6),
                    reader.GetString(7),
                    reader.GetDateTime(8));
            }
        }
        if (batchInfo is null) return null;
        var id = batchInfo.Id;

        var events = new List<TraceEventDto>();
        var eventMeta = new List<(int OrgId, int UserId)>();
        using (var cmd = conn.CreateCommand())
        {
            cmd.CommandText = @"
                SELECT e.Id, e.EventType, e.CreatedAt, e.OrganizationId, e.UserId,
                       o.Name AS OrgName, u.FullName AS UserName, e.Location, e.EventData, e.PreviousHash, e.CurrentHash
                FROM SupplyChainEvents e
                LEFT JOIN Organizations o ON o.Id = e.OrganizationId
                LEFT JOIN Users u ON u.Id = e.UserId
                WHERE e.BatchId = @id
                ORDER BY e.CreatedAt ASC";
            var p = cmd.CreateParameter(); p.ParameterName = "@id"; p.Value = id;
            cmd.Parameters.Add(p);
            using var reader = await cmd.ExecuteReaderAsync(ct);
            while (await reader.ReadAsync(ct))
            {
                var orgId = reader.IsDBNull(3) ? 0 : reader.GetInt32(3);
                var userId = reader.IsDBNull(4) ? 0 : reader.GetInt32(4);

                events.Add(new TraceEventDto(
                    reader.GetInt32(0),
                    reader.GetString(1),
                    reader.GetDateTime(2),
                    reader.IsDBNull(5) ? null : reader.GetString(5),
                    reader.IsDBNull(6) ? null : reader.GetString(6),
                    reader.IsDBNull(7) ? null : reader.GetString(7),
                    reader.IsDBNull(8) ? null : reader.GetString(8),
                    reader.IsDBNull(9) ? null : reader.GetString(9),
                    reader.IsDBNull(10) ? string.Empty : reader.GetString(10)));

                eventMeta.Add((orgId, userId));
            }
        }

        var inspections = new List<TraceInspectionDto>();
        using (var cmd = conn.CreateCommand())
        {
            cmd.CommandText = @"
                SELECT i.Id, u.FullName AS InspectorName, i.Result, i.CreatedAt, i.Notes
                FROM Inspections i
                LEFT JOIN Users u ON u.Id = i.InspectorId
                WHERE i.BatchId = @id
                ORDER BY i.CreatedAt DESC";
            var p = cmd.CreateParameter(); p.ParameterName = "@id"; p.Value = id;
            cmd.Parameters.Add(p);
            using var reader = await cmd.ExecuteReaderAsync(ct);
            while (await reader.ReadAsync(ct))
            {
                inspections.Add(new TraceInspectionDto(
                    reader.GetInt32(0),
                    reader.IsDBNull(1) ? null : reader.GetString(1),
                    reader.IsDBNull(2) ? null : reader.GetString(2),
                    reader.IsDBNull(3) ? null : reader.GetDateTime(3),
                    reader.IsDBNull(4) ? null : reader.GetString(4)));
            }
        }

        var certificates = new List<TraceCertificateDto>();
        using (var cmd = conn.CreateCommand())
        {
            cmd.CommandText = @"
                SELECT c.Id, c.CertificateType, 'Cục Kiểm Định' AS IssuingOrg, c.FileUrl,
                       c.IssuedAt, NULL AS ExpirationDate
                FROM Certificates c
                WHERE c.BatchId = @id
                ORDER BY c.IssuedAt DESC";
            var p = cmd.CreateParameter(); p.ParameterName = "@id"; p.Value = id;
            cmd.Parameters.Add(p);
            using var reader = await cmd.ExecuteReaderAsync(ct);
            while (await reader.ReadAsync(ct))
            {
                certificates.Add(new TraceCertificateDto(
                    reader.GetInt32(0),
                    reader.IsDBNull(1) ? null : reader.GetString(1),
                    reader.IsDBNull(2) ? null : reader.GetString(2),
                    reader.IsDBNull(3) ? null : reader.GetString(3),
                    reader.IsDBNull(4) ? null : reader.GetDateTime(4),
                    null));
            }
        }

        // Verify hash chain by recomputing SHA-256 for each event using stored orgId/userId
        bool hashChainValid = true;
        if (events.Count > 0)
        {
            for (int i = 0; i < events.Count; i++)
            {
                var e = events[i];
                var meta = eventMeta[i];
                if (i > 0 && e.PreviousHash != events[i - 1].CurrentHash)
                {
                    hashChainValid = false; break;
                }

                // Recompute expected current hash
                string ComputeExpectedHash()
                {
                    var sb = new System.Text.StringBuilder();
                    sb.Append(e.Id /* use batch id later */);
                    // We need batch id, replace with actual batchInfo.Id
                    sb.Clear();
                    sb.Append(batchInfo.Id).Append('|');
                    sb.Append(e.EventType).Append('|');
                    sb.Append(meta.OrgId).Append('|');
                    sb.Append(meta.UserId).Append('|');
                    sb.Append(HashCanonical.Timestamp(e.EventTime)).Append('|');
                    sb.Append(e.AdditionalData ?? string.Empty).Append('|');
                    sb.Append(e.Location ?? string.Empty);

                    var bytes = System.Text.Encoding.UTF8.GetBytes(sb.ToString());
                    var hash = System.Security.Cryptography.SHA256.HashData(bytes);
                    return Convert.ToHexString(hash);
                }

                var expected = ComputeExpectedHash();
                if (!string.Equals(expected, e.CurrentHash, StringComparison.OrdinalIgnoreCase))
                {
                    hashChainValid = false; break;
                }
            }
        }

        return new TraceResultDto(batchInfo, events, inspections, certificates, hashChainValid);
    }

    private static bool VerifyHashChain(IReadOnlyList<TraceEventDto> events)
    {
        if (events.Count == 0) return true;
        if (events[0].PreviousHash is not null) return false;
        for (int i = 1; i < events.Count; i++)
        {
            if (events[i].PreviousHash != events[i - 1].CurrentHash) return false;
        }
        return true;
    }

    private static Batch Map(BatchDataModel x) => new(
        x.Id, x.ProductId, x.BatchCode, x.Quantity, x.CurrentOrganizationId,
        x.ParentBatchId, x.RootBatchId, x.QRCode, x.CreatedAt,
        x.Events.Select(e => new SupplyChainEvent(e.Id, e.BatchId, e.EventType, e.OrganizationId, e.UserId,
            e.EventData, e.Location, e.PreviousHash, e.CurrentHash, e.CreatedAt)));

    public async Task CreateBatchRelationAsync(int sourceBatchId, int targetBatchId, string relationType, decimal? quantity, CancellationToken ct = default)
    {
        var row = new BatchRelationDataModel
        {
            SourceBatchId = sourceBatchId,
            TargetBatchId = targetBatchId,
            RelationType = relationType,
            Quantity = quantity,
            CreatedAt = DateTime.UtcNow
        };

        db.BatchRelations.Add(row);
        await db.SaveChangesAsync(ct);
    }

    public async Task AddBatchImageAsync(int batchId, string imageUrl, string? caption, int displayOrder, int? eventId, CancellationToken ct = default)
    {
        var row = new BatchImageDataModel
        {
            BatchId = batchId,
            ImageUrl = imageUrl,
            Caption = caption,
            DisplayOrder = displayOrder,
            EventId = eventId,
            CreatedAt = DateTime.UtcNow
        };

        db.BatchImages.Add(row);
        await db.SaveChangesAsync(ct);
    }

    public async Task<LineageResult?> GetLineageAsync(string batchIdOrCode, CancellationToken ct = default)
    {
        var trimmed = batchIdOrCode.Trim();
        int? numericId = int.TryParse(trimmed, out var val) ? val : null;

        var targetBatch = await db.Batches.AsNoTracking()
            .FirstOrDefaultAsync(b =>
                b.BatchCode == trimmed ||
                (numericId.HasValue && b.Id == numericId.Value) ||
                (b.QRCode != null && b.QRCode.Contains(trimmed)), ct);

        if (targetBatch is null) return null;
        var batchId = targetBatch.Id;

        var visited = new HashSet<int>();
        var queue = new Queue<int>();
        visited.Add(batchId);
        queue.Enqueue(batchId);

        while (queue.Count > 0)
        {
            var current = queue.Dequeue();

            var related = await db.BatchRelations
                .AsNoTracking()
                .Where(r => r.SourceBatchId == current || r.TargetBatchId == current)
                .ToListAsync(ct);

            foreach (var rel in related)
            {
                if (!visited.Contains(rel.SourceBatchId)) { visited.Add(rel.SourceBatchId); queue.Enqueue(rel.SourceBatchId); }
                if (!visited.Contains(rel.TargetBatchId)) { visited.Add(rel.TargetBatchId); queue.Enqueue(rel.TargetBatchId); }
            }
        }

        if (visited.Count == 0) return null;

        var batches = await db.Batches
            .AsNoTracking()
            .Where(b => visited.Contains(b.Id))
            .Select(b => new LineageNode(b.Id, b.BatchCode, b.Quantity))
            .ToListAsync(ct);

        var edges = await db.BatchRelations
            .AsNoTracking()
            .Where(r => visited.Contains(r.SourceBatchId) || visited.Contains(r.TargetBatchId))
            .Select(r => new LineageEdge(r.SourceBatchId, r.TargetBatchId, r.RelationType))
            .ToListAsync(ct);

        return new LineageResult(batches, edges);
    }
}
