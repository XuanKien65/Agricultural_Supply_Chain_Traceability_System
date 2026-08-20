using AgriTrace.Domain.Common;
using AgriTrace.Domain.Entities;

namespace AgriTrace.Domain.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email, CancellationToken ct = default);
    Task<User?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<PagedResult<User>> GetAllPagedAsync(int? organizationId, string? role, bool? isActive, string? search, int page, int pageSize, CancellationToken ct = default);
    Task<User> AddAsync(User user, CancellationToken ct = default);
    Task<User> UpdateAsync(User user, CancellationToken ct = default);
    Task UpdateStatusAsync(int userId, bool isActive, CancellationToken ct = default);
    Task UpdatePasswordAsync(int userId, string passwordHash, CancellationToken ct = default);
}
