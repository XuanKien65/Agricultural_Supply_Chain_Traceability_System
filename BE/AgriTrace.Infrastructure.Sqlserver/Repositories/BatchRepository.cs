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
        page = Math.Max(1, page); pageSize = Math.Clamp(pageSize, 1, 100);
        var query = db.Batches.AsNoTracking().Include(x => x.Events).Where(x => x.ProducerOrganizationId == organizationId);
        if (!string.IsNullOrWhiteSpace(status)) query = query.Where(x => x.Status == status);
        if (!string.IsNullOrWhiteSpace(search)) query = query.Where(x => x.QrCode.Contains(search));
        var total = await query.CountAsync(ct);
        var rows = await query.OrderByDescending(x => x.CreatedAt).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);
        return new(rows.Select(Map).ToList(), total);
    }
    public async Task<Batch?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var row = await db.Batches.AsNoTracking().Include(x => x.Events).FirstOrDefaultAsync(x => x.Id == id, ct);
        return row is null ? null : Map(row);
    }
    public async Task<Batch> AddAsync(Batch batch, CancellationToken ct = default)
    {
        var first = batch.Events.Single();
        var row = new BatchDataModel { ProductId = batch.ProductId, ProducerOrganizationId = batch.ProducerOrganizationId,
            ParentBatchId = batch.ParentBatchId, QrCode = $"pending-{Guid.NewGuid():N}", HarvestDate = batch.HarvestDate,
            Weight = batch.Weight, Status = batch.Status, CreatedAt = batch.CreatedAt };
        db.Batches.Add(row); await db.SaveChangesAsync(ct);
        row.QrCode = $"/trace/{row.Id}";
        var hash = SupplyChainEvent.ComputeHash(row.Id, first.OrganizationId, first.PerformedByUserId, first.EventType,
            first.EventTime, first.Location, first.AdditionalData, null);
        row.Events.Add(new SupplyChainEventDataModel { OrganizationId = first.OrganizationId,
            PerformedByUserId = first.PerformedByUserId, EventType = first.EventType, EventTime = first.EventTime,
            Location = first.Location, AdditionalData = first.AdditionalData, Hash = hash });
        await db.SaveChangesAsync(ct); return Map(row);
    }
    public async Task<SupplyChainEvent> AppendEventAsync(Batch batch, SupplyChainEvent e, CancellationToken ct = default)
    {
        var row = new SupplyChainEventDataModel { BatchId = batch.Id, OrganizationId = e.OrganizationId,
            PerformedByUserId = e.PerformedByUserId, PreviousEventId = e.PreviousEventId, EventType = e.EventType,
            EventTime = e.EventTime, Location = e.Location, AdditionalData = e.AdditionalData, Hash = e.Hash, PreviousHash = e.PreviousHash };
        db.SupplyChainEvents.Add(row); await db.SaveChangesAsync(ct);
        return new(row.Id, row.BatchId, row.OrganizationId, row.PerformedByUserId, row.PreviousEventId, row.EventType,
            row.EventTime, row.Location, row.AdditionalData, row.PreviousHash, row.Hash);
    }
    private static Batch Map(BatchDataModel x) => new(x.Id, x.ProductId, x.ProducerOrganizationId, x.ParentBatchId,
        x.QrCode, x.HarvestDate, x.Weight, x.Status, x.CreatedAt, x.Events.Select(e => new SupplyChainEvent(e.Id,
        e.BatchId, e.OrganizationId, e.PerformedByUserId, e.PreviousEventId, e.EventType, e.EventTime, e.Location,
        e.AdditionalData, e.PreviousHash, e.Hash, e.DigitalSignature)));
}
