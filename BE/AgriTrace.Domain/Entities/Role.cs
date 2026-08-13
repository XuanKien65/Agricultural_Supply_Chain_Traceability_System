namespace AgriTrace.Domain.Entities;

/// <summary>
/// Vai trò người dùng trong hệ thống chuỗi cung ứng.
/// Gồm 7 vai trò: Admin, Farmer, Processor, Distributor, Retailer, Inspector, Consumer.
/// </summary>
public sealed class Role
{
    public int Id { get; private set; }
    public string Name { get; private set; }
    public string? Description { get; private set; }

    // Các hằng tên role khớp với dữ liệu trong DB
    public const string Admin = "Admin";
    public const string Farmer = "Farmer";
    public const string Processor = "Processor";
    public const string Distributor = "Distributor";
    public const string Retailer = "Retailer";
    public const string Inspector = "Inspector";
    public const string Consumer = "Consumer";

    public Role(int id, string name, string? description)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Role name cannot be empty.", nameof(name));
        Id = id;
        Name = name.Trim();
        Description = description?.Trim();
    }
}
