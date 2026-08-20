namespace AgriTrace.Domain.Entities;

public sealed class Organization
{
    public int Id { get; private set; }
    public string Name { get; private set; }
    public string Type { get; private set; } // FARM, PROCESSOR, DISTRIBUTOR, RETAILER
    public string Status { get; private set; } // ACTIVE, INACTIVE, SUSPENDED
    public DateTime CreatedAt { get; private set; }

    public Organization(int id, string name, string type, string status = "ACTIVE", DateTime? createdAt = null)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("Name cannot be empty.", nameof(name));
        if (string.IsNullOrWhiteSpace(type)) throw new ArgumentException("Type cannot be empty.", nameof(type));

        Id = id;
        Name = name.Trim();
        Type = type.Trim().ToUpperInvariant();
        Status = status.Trim().ToUpperInvariant();
        CreatedAt = createdAt ?? DateTime.UtcNow;
    }

    public void Update(string name, string type)
    {
        Name = name.Trim();
        Type = type.Trim().ToUpperInvariant();
    }

    public void SetStatus(string status)
    {
        Status = status.Trim().ToUpperInvariant();
    }
}
