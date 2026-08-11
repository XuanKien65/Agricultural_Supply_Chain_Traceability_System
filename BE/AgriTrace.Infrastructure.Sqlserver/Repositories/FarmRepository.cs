using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using AgriTrace.Domain.Common;
using AgriTrace.Domain.Entities;
using AgriTrace.Domain.Interfaces;
using AgriTrace.Infrastructure.Sqlserver.Models;
using AgriTrace.Infrastructure.Sqlserver.Persistence;

namespace AgriTrace.Infrastructure.Sqlserver.Repositories
{
    /// <summary>
    /// Hiện thực IFarmRepository bằng EF Core.
    /// Chịu trách nhiệm chuyển đổi hai chiều (manual mapping) giữa Data Model và Domain Entity,
    /// đồng thời tải kèm danh sách Crop (quan hệ 1 - N) qua Include().
    /// </summary>
    public class FarmRepository : IFarmRepository
    {
        private readonly ApplicationDbContext _dbContext;

        public FarmRepository(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<Farm?> GetByIdAsync(Guid farmId)
        {
            var dataModel = await _dbContext.Farms
                .AsNoTracking()
                .Include(f => f.Crops)
                .FirstOrDefaultAsync(f => f.Id == farmId);

            return MapToDomain(dataModel);
        }

        public async Task<IReadOnlyList<Farm>> GetAllAsync()
        {
            var dataModels = await _dbContext.Farms
                .AsNoTracking()
                .Include(f => f.Crops)
                .ToListAsync();

            return dataModels.Select(MapToDomain).Where(f => f != null).ToList()!;
        }

        public async Task<PagedResult<Farm>> GetPagedAsync(int pageNumber, int pageSize)
        {
            // Tự bảo vệ contract: chặn Skip/Take âm khiến EF ném lỗi lúc chạy.
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 1;

            var query = _dbContext.Farms.AsNoTracking();

            var totalCount = await query.CountAsync();

            var dataModels = await query
                .OrderByDescending(f => f.CreatedAt)
                .Include(f => f.Crops)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var items = dataModels.Select(MapToDomain).Where(f => f != null).ToList()!;
            return new PagedResult<Farm>(items!, totalCount);
        }

        public async Task<Farm> AddAsync(Farm farm)
        {
            var dataModel = MapToDataModel(farm);
            await _dbContext.Farms.AddAsync(dataModel);
            await _dbContext.SaveChangesAsync();
            return MapToDomain(dataModel)!;
        }

        public async Task UpdateAsync(Farm farm)
        {
            // Tải bản ghi hiện có kèm Crop để đồng bộ danh sách con.
            var existing = await _dbContext.Farms
                .Include(f => f.Crops)
                .FirstOrDefaultAsync(f => f.Id == farm.Id);

            if (existing == null) return;

            existing.Name = farm.Name;
            existing.Location = farm.Location;
            existing.UpdatedAt = farm.UpdatedAt;

            // Thêm những Crop mới chưa có trong database (so theo Id).
            var existingCropIds = existing.Crops.Select(c => c.Id).ToHashSet();
            foreach (var crop in farm.Crops)
            {
                if (!existingCropIds.Contains(crop.Id))
                {
                    existing.Crops.Add(MapCropToDataModel(crop));
                }
            }

            await _dbContext.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid farmId)
        {
            var dataModel = await _dbContext.Farms.FindAsync(farmId);
            if (dataModel != null)
            {
                // Crop sẽ bị xóa theo nhờ cấu hình Cascade Delete.
                _dbContext.Farms.Remove(dataModel);
                await _dbContext.SaveChangesAsync();
            }
        }

        // ---- Mapping: Data Model -> Domain Entity ----
        private Farm? MapToDomain(FarmDataModel? dataModel)
        {
            if (dataModel == null) return null;

            var crops = dataModel.Crops
                .Select(c => new Crop(c.Id, c.FarmId, c.Name, c.AreaHectares, c.CreatedAt, c.UpdatedAt))
                .ToList();

            return new Farm(
                dataModel.Id,
                dataModel.Name,
                dataModel.Location,
                dataModel.CreatedAt,
                dataModel.UpdatedAt,
                crops
            );
        }

        // ---- Mapping: Domain Entity -> Data Model ----
        private FarmDataModel MapToDataModel(Farm domain)
        {
            return new FarmDataModel
            {
                Id = domain.Id,
                Name = domain.Name,
                Location = domain.Location,
                CreatedAt = domain.CreatedAt,
                UpdatedAt = domain.UpdatedAt,
                Crops = domain.Crops.Select(MapCropToDataModel).ToList()
            };
        }

        private CropDataModel MapCropToDataModel(Crop crop)
        {
            return new CropDataModel
            {
                Id = crop.Id,
                FarmId = crop.FarmId,
                Name = crop.Name,
                AreaHectares = crop.AreaHectares,
                CreatedAt = crop.CreatedAt,
                UpdatedAt = crop.UpdatedAt
            };
        }
    }
}
