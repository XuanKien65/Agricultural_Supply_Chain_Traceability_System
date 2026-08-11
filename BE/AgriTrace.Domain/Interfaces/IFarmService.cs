using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AgriTrace.Domain.Common;
using AgriTrace.Domain.Entities;

namespace AgriTrace.Domain.Interfaces
{
    /// <summary>
    /// Domain Service cho Aggregate Root "Farm".
    /// Tầng Application (Commands/Queries) gọi vào đây; Domain Service chịu trách nhiệm
    /// điều phối nghiệp vụ và làm việc với Repository. Application KHÔNG gọi thẳng Repository.
    /// </summary>
    public interface IFarmService
    {
        // Tạo mới một nông trại (phía "1").
        Task<Farm> CreateFarmAsync(string name, string location);

        // Thêm một mùa vụ (phía "N") vào nông trại đã có. Trả về Crop vừa tạo, hoặc null nếu không tìm thấy Farm.
        Task<Crop?> AddCropToFarmAsync(Guid farmId, string name, decimal areaHectares);

        // Lấy một nông trại kèm toàn bộ mùa vụ (quan hệ 1 - N).
        Task<Farm?> GetFarmByIdAsync(Guid farmId);

        // Lấy toàn bộ nông trại.
        Task<IReadOnlyList<Farm>> GetAllFarmsAsync();

        // Lấy một trang nông trại kèm tổng số bản ghi (phân trang).
        Task<PagedResult<Farm>> GetFarmsAsync(int pageNumber, int pageSize);
    }
}
