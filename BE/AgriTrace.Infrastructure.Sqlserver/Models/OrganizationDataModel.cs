using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AgriTrace.Infrastructure.Sqlserver.Models;

[Table("Organizations")]
public sealed class OrganizationDataModel
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(200)]
    public string Name { get; set; } = null!;

    [Required, MaxLength(50)]
    public string Type { get; set; } = null!; // FARM / PROCESSOR / DISTRIBUTOR / RETAILER

    [Required, MaxLength(20)]
    public string Status { get; set; } = "ACTIVE"; // ACTIVE / INACTIVE / SUSPENDED

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public List<UserDataModel> Users { get; set; } = [];
    public List<ProductDataModel> Products { get; set; } = [];
}
