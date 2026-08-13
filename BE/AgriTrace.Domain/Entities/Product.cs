namespace AgriTrace.Domain.Entities;

public sealed class Product
{
    public int Id { get; private set; }
    public string Name { get; private set; }
    public string? Unit { get; private set; }
    public string? Description { get; private set; }

    public Product(int id, string name, string? unit, string? description)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("Product name is required.", nameof(name));
        Id = id;
        Name = name.Trim();
        Unit = unit?.Trim();
        Description = description?.Trim();
    }
}
