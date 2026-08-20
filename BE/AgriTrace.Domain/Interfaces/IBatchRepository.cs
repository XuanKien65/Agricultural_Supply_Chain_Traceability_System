using AgriTrace.Domain.Common;
using AgriTrace.Domain.Contracts;
using AgriTrace.Domain.Entities;

namespace AgriTrace.Domain.Interfaces;

public interface IBatchRepository
{
    Task<PagedResult<Batch>> GetFarmerBatchesAsync(int organizationId, string? search, string? status, int page, int pageSize, CancellationToken cancellationToken = default);
    Task<Batch?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<Batch> AddAsync(Batch batch, CancellationToken cancellationToken = default);
    Task<SupplyChainEvent> AppendEventAsync(Batch batch, SupplyChainEvent supplyChainEvent, CancellationToken cancellationToken = default);

    /// <summary>Tra cứu công khai: Lấy Batch + Events + Inspections + Certificates cho Consumer.</summary>
    Task<TraceResultDto?> GetByIdWithFullTraceAsync(int id, CancellationToken cancellationToken = default);
}
