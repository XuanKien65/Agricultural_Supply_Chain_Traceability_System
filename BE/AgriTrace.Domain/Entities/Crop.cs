using System;
using AgriTrace.Domain.Common;

namespace AgriTrace.Domain.Entities
{
    /// <summary>
    /// Mùa vụ (Crop) - phía "N" trong quan hệ 1 - N.
    /// Mỗi Crop luôn thuộc về đúng một Farm, thể hiện qua khóa ngoại FarmId.
    /// </summary>
    public class Crop : BaseEntity
    {
        /// <summary>Khóa ngoại trỏ về nông trại sở hữu mùa vụ này (phía "1").</summary>
        public Guid FarmId { get; private set; }

        public string Name { get; private set; } = null!;
        public decimal AreaHectares { get; private set; }

        // Constructor rỗng phục vụ EF Core / mapping ngược từ database.
        private Crop() { }

        // Tạo mới một mùa vụ gắn với một nông trại.
        public Crop(Guid farmId, string name, decimal areaHectares)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Crop name cannot be empty.", nameof(name));
            if (areaHectares <= 0)
                throw new ArgumentException("Crop area must be greater than zero.", nameof(areaHectares));

            FarmId = farmId;
            Name = name;
            AreaHectares = areaHectares;
        }

        // Dựng lại mùa vụ từ dữ liệu database.
        public Crop(Guid id, Guid farmId, string name, decimal areaHectares, DateTime createdAt, DateTime? updatedAt)
            : base(id, createdAt, updatedAt)
        {
            FarmId = farmId;
            Name = name;
            AreaHectares = areaHectares;
        }
    }
}
