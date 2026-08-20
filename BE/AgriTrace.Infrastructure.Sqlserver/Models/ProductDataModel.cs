using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AgriTrace.Infrastructure.Sqlserver.Models;

[Table("Products")]
public sealed class ProductDataModel
{
    [Key]
    public int Id { get; set; }

    [MaxLength(200)]
    public string? Name { get; set; }

    [MaxLength(100)]
    public string? Category { get; set; }

    [MaxLength(50)]
    public string? Unit { get; set; }

    public int OrganizationId { get; set; }

    [ForeignKey(nameof(OrganizationId))]
    public OrganizationDataModel Organization { get; set; } = null!;
}
