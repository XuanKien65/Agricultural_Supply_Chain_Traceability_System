using AgriTrace.Domain.Common;
using AgriTrace.Domain.Entities;

namespace AgriTrace.Domain.Interfaces;

public interface IOrganizationRepository
{
    Task<Organization?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<PagedResult<Organization>> GetAllPagedAsync(string? type, string? status, string? search, int page, int pageSize, CancellationToken ct = default);
    Task<Organization> AddAsync(Organization organization, CancellationToken ct = default);
    Task<Organization> UpdateAsync(Organization organization, CancellationToken ct = default);
    Task UpdateStatusAsync(int id, string status, CancellationToken ct = default);
}
