using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AgriTrace.Domain.Common;
using AgriTrace.Domain.Entities;
using AgriTrace.Domain.Interfaces;

namespace AgriTrace.Domain.Services
{
    /// <summary>
    /// Cài đặt Domain Service cho "Farm".
    /// Chứa luồng nghiệp vụ của Aggregate Root và là nơi duy nhất gọi tới IFarmRepository,
    /// giữ cho tầng Application tách khỏi hạ tầng lưu trữ.
    /// </summary>
    public class FarmService : IFarmService
    {
        private readonly IFarmRepository _farmRepository;

        public FarmService(IFarmRepository farmRepository)
        {
            _farmRepository = farmRepository;
        }

        public async Task<Farm> CreateFarmAsync(string name, string location)
        {
            var farm = new Farm(name, location);
            return await _farmRepository.AddAsync(farm);
        }

        public async Task<Crop?> AddCropToFarmAsync(Guid farmId, string name, decimal areaHectares)
        {
            var farm = await _farmRepository.GetByIdAsync(farmId);
            if (farm == null)
            {
                return null;
            }

            // Tạo quan hệ 1 - N qua phương thức nghiệp vụ của Aggregate Root.
            var crop = farm.AddCrop(name, areaHectares);

            await _farmRepository.UpdateAsync(farm);
            return crop;
        }

        public async Task<Farm?> GetFarmByIdAsync(Guid farmId)
        {
            return await _farmRepository.GetByIdAsync(farmId);
        }

        public async Task<IReadOnlyList<Farm>> GetAllFarmsAsync()
        {
            return await _farmRepository.GetAllAsync();
        }

        public async Task<PagedResult<Farm>> GetFarmsAsync(int pageNumber, int pageSize)
        {
            return await _farmRepository.GetPagedAsync(pageNumber, pageSize);
        }
    }
}
