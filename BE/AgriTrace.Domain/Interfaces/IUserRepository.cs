using AgriTrace.Domain.Common;
using AgriTrace.Domain.Entities;

namespace AgriTrace.Domain.Interfaces;

public interface IUserRepository
{
    /// <summary>Tìm user theo username (không phân biệt hoa thường).</summary>
    Task<User?> GetByUsernameAsync(string username, CancellationToken ct = default);

    /// <summary>Tìm user theo email (không phân biệt hoa thường).</summary>
    Task<User?> GetByEmailAsync(string email, CancellationToken ct = default);

    /// <summary>Lấy user theo Id, kèm RoleName.</summary>
    Task<User?> GetByIdAsync(int id, CancellationToken ct = default);

    /// <summary>Lưu user mới vào DB, trả về user đã có Id.</summary>
    Task<User> AddAsync(User user, CancellationToken ct = default);

    /// <summary>Cập nhật trạng thái Active/Inactive.</summary>
    Task UpdateStatusAsync(int userId, string status, CancellationToken ct = default);

    /// <summary>Danh sách user có phân trang (dành cho Admin).</summary>
    Task<PagedResult<User>> GetAllPagedAsync(string? search, string? roleFilter, int page, int pageSize, CancellationToken ct = default);
}
