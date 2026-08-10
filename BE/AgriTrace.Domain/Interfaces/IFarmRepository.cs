using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AgriTrace.Domain.Common;
using AgriTrace.Domain.Entities;

namespace AgriTrace.Domain.Interfaces
{
    /// <summary>
    /// Repository cho Aggregate Root "Farm".
    /// Theo DDD, Crop là entity con nằm trong cụm Farm nên KHÔNG có repository riêng:
    /// mọi thao tác với Crop đều đi qua Farm.
    /// </summary>
    public interface IFarmRepository
    {
        // Lấy nông trại kèm toàn bộ mùa vụ (quan hệ 1 - N).
        Task<Farm?> GetByIdAsync(Guid farmId);
        Task<IReadOnlyList<Farm>> GetAllAsync();

        // Lấy một trang nông trại kèm tổng số bản ghi (phục vụ phân trang).
        Task<PagedResult<Farm>> GetPagedAsync(int pageNumber, int pageSize);
        Task<Farm> AddAsync(Farm farm);
        Task UpdateAsync(Farm farm);
        Task DeleteAsync(Guid farmId);
    }
}
