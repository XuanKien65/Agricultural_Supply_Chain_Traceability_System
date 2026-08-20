namespace AgriTrace.Domain.Entities;

public sealed class Product
{
    public int Id { get; private set; }
    public string Name { get; private set; }
    public string? Category { get; private set; }
    public string? Unit { get; private set; }
    public int OrganizationId { get; private set; }

    // Nav / Joined
    public string? OrganizationName { get; private set; }

    public Product(int id, string name, string? category, string? unit, int organizationId, string? organizationName = null)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("Product name is required.", nameof(name));
        Id = id;
        Name = name.Trim();
        Category = category?.Trim();
        Unit = unit?.Trim();
        OrganizationId = organizationId;
        OrganizationName = organizationName;
    }

    public void Update(string name, string? category, string? unit)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("Product name is required.", nameof(name));
        Name = name.Trim();
        Category = category?.Trim();
        Unit = unit?.Trim();
    }
}
