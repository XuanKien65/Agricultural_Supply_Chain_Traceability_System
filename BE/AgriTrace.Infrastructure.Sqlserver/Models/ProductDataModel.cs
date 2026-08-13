namespace AgriTrace.Infrastructure.Sqlserver.Models;

public sealed class ProductDataModel
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Unit { get; set; }
    public string? Description { get; set; }
}
