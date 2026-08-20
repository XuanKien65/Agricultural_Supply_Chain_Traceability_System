using AgriTrace.Domain.Contracts;
using AgriTrace.Domain.Interfaces;
using AgriTrace.Infrastructure.Sqlserver.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AgriTrace.Infrastructure.Sqlserver.Repositories;

public sealed class AnalyticsRepository(ApplicationDbContext db) : IAnalyticsRepository
{
    public async Task<OverviewDto> GetOverviewAsync(CancellationToken ct = default)
    {
        var orgCount = await db.Organizations.CountAsync(ct);
        var userCount = await db.Users.CountAsync(ct);
        var batchCount = await db.Batches.CountAsync(ct);
        var eventCount = await db.SupplyChainEvents.CountAsync(ct);
        var inspectionCount = await db.Inspections.CountAsync(ct);
        var certCount = await db.Certificates.CountAsync(ct);
        var recallCount = await db.Recalls.CountAsync(ct);
        var activeRecallCount = await db.Recalls.CountAsync(r => r.Status == "ACTIVE", ct);

        return new OverviewDto(
            orgCount,
            userCount,
            batchCount,
            eventCount,
            inspectionCount,
            certCount,
            recallCount,
            activeRecallCount);
    }

    public async Task<BatchDistributionDto> GetBatchDistributionAsync(int? organizationId = null, CancellationToken ct = default)
    {
        var orgQuery = db.Organizations.AsNoTracking();
        if (organizationId.HasValue)
        {
            orgQuery = orgQuery.Where(o => o.Id == organizationId.Value);
        }

        var orgs = await orgQuery.ToListAsync(ct);

        var batches = await db.Batches
            .AsNoTracking()
            .Where(b => b.CurrentOrganizationId.HasValue)
            .ToListAsync(ct);

        var items = orgs.Select(o =>
        {
            var orgBatches = batches.Where(b => b.CurrentOrganizationId == o.Id).ToList();
            return new BatchDistributionItemDto(
                o.Id,
                o.Name,
                o.Type,
                orgBatches.Count,
                orgBatches.Sum(b => b.Quantity));
        }).OrderByDescending(x => x.BatchCount).ToList();

        return new BatchDistributionDto(items);
    }

    public async Task<ProcessingTimeDto> GetProcessingTimeAsync(int? organizationId = null, CancellationToken ct = default)
    {
        var query = db.SupplyChainEvents.AsNoTracking();
        if (organizationId.HasValue)
        {
            query = query.Where(e => e.OrganizationId == organizationId.Value);
        }

        var events = await query
            .OrderBy(e => e.BatchId)
            .ThenBy(e => e.CreatedAt)
            .Select(e => new { e.BatchId, e.EventType, e.CreatedAt })
            .ToListAsync(ct);

        var transitionDurations = new Dictionary<(string From, string To), List<double>>();

        var groupedByBatch = events.GroupBy(e => e.BatchId);
        foreach (var batchEvents in groupedByBatch)
        {
            var list = batchEvents.ToList();
            for (int i = 0; i < list.Count - 1; i++)
            {
                var from = list[i];
                var to = list[i + 1];
                var key = (from.EventType, to.EventType);
                var hours = (to.CreatedAt - from.CreatedAt).TotalHours;
                if (hours >= 0)
                {
                    if (!transitionDurations.ContainsKey(key))
                        transitionDurations[key] = new List<double>();
                    transitionDurations[key].Add(hours);
                }
            }
        }

        var items = transitionDurations.Select(kv => new ProcessingTimeItemDto(
            kv.Key.From,
            kv.Key.To,
            Math.Round(kv.Value.Average(), 2),
            kv.Value.Count
        )).OrderByDescending(x => x.SampleCount).ToList();

        return new ProcessingTimeDto(items);
    }

    public async Task<TracebackDto?> GetTracebackAsync(int batchId, CancellationToken ct = default)
    {
        var targetBatch = await db.Batches
            .AsNoTracking()
            .FirstOrDefaultAsync(b => b.Id == batchId, ct);

        if (targetBatch is null) return null;

        var ancestorIds = new List<int> { batchId };
        var currentParentId = targetBatch.ParentBatchId;
        int depth = 1;

        var ancestors = new List<TracebackNodeDto>();

        // Truy ngược theo ParentBatchId
        while (currentParentId.HasValue && !ancestorIds.Contains(currentParentId.Value))
        {
            var parent = await db.Batches
                .AsNoTracking()
                .Include(b => b.CurrentOrganization)
                .FirstOrDefaultAsync(b => b.Id == currentParentId.Value, ct);

            if (parent is null) break;

            ancestorIds.Add(parent.Id);
            ancestors.Add(new TracebackNodeDto(
                parent.Id,
                parent.BatchCode,
                parent.Quantity,
                parent.CurrentOrganization?.Name,
                parent.CreatedAt,
                depth++));

            currentParentId = parent.ParentBatchId;
        }

        // Lấy tất cả events của target batch và toàn bộ ancestors
        var allEvents = await db.SupplyChainEvents
            .AsNoTracking()
            .Include(e => e.Batch)
            .Include(e => e.Organization)
            .Where(e => ancestorIds.Contains(e.BatchId))
            .OrderBy(e => e.CreatedAt)
            .Select(e => new TracebackEventDto(
                e.BatchId,
                e.Batch != null ? e.Batch.BatchCode : string.Empty,
                e.EventType,
                e.Organization != null ? e.Organization.Name : null,
                e.Location,
                e.CreatedAt))
            .ToListAsync(ct);

        return new TracebackDto(targetBatch.Id, targetBatch.BatchCode, ancestors, allEvents);
    }
}
