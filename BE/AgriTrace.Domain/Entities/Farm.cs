using System;
using System.Collections.Generic;
using AgriTrace.Domain.Common;

namespace AgriTrace.Domain.Entities
{
    /// <summary>
    /// Nông trại (Farm) - phía "1" trong quan hệ 1 - N.
    /// Đây là Aggregate Root: một Farm sở hữu (quản lý) nhiều Crop (mùa vụ).
    /// Mọi thao tác thêm/bớt Crop đều đi qua Farm để bảo vệ tính toàn vẹn của cụm.
    /// </summary>
    public class Farm : BaseEntity
    {
        public string Name { get; private set; } = null!;
        public string Location { get; private set; } = null!;

        // Danh sách Crop được giữ private để bên ngoài không sửa trực tiếp.
        private readonly List<Crop> _crops = new();

        /// <summary>Danh sách mùa vụ thuộc nông trại (chỉ đọc).</summary>
        public IReadOnlyCollection<Crop> Crops => _crops.AsReadOnly();

        // Constructor rỗng phục vụ EF Core / mapping ngược từ database.
        private Farm() { }

        // Tạo mới một nông trại.
        public Farm(string name, string location)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Farm name cannot be empty.", nameof(name));
            if (string.IsNullOrWhiteSpace(location))
                throw new ArgumentException("Farm location cannot be empty.", nameof(location));

            Name = name;
            Location = location;
        }

        // Dựng lại nông trại (kèm danh sách mùa vụ) từ dữ liệu database.
        public Farm(Guid id, string name, string location, DateTime createdAt, DateTime? updatedAt, IEnumerable<Crop>? crops = null)
            : base(id, createdAt, updatedAt)
        {
            Name = name;
            Location = location;
            if (crops != null)
                _crops.AddRange(crops);
        }

        /// <summary>
        /// Thêm một mùa vụ mới vào nông trại (tạo quan hệ 1 - N).
        /// Trả về Crop vừa tạo để tầng gọi có thể sử dụng.
        /// </summary>
        public Crop AddCrop(string name, decimal areaHectares)
        {
            var crop = new Crop(Id, name, areaHectares);
            _crops.Add(crop);
            MarkUpdated();
            return crop;
        }

        public void UpdateDetails(string name, string location)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Farm name cannot be empty.", nameof(name));
            if (string.IsNullOrWhiteSpace(location))
                throw new ArgumentException("Farm location cannot be empty.", nameof(location));

            Name = name;
            Location = location;
            MarkUpdated();
        }
    }
}
