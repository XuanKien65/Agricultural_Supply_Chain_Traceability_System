namespace AgriTrace.Infrastructure.Sqlserver.Models;

public sealed class RoleDataModel
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }

    public List<UserDataModel> Users { get; set; } = [];
}
