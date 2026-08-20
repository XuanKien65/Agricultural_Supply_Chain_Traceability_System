using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AgriTrace.Infrastructure.Sqlserver.Models;

[Table("Inspections")]
public sealed class InspectionDataModel
{
    [Key]
    public int Id { get; set; }

    public int BatchId { get; set; }

    public int InspectorId { get; set; }

    [Required, MaxLength(100)]
    public string Result { get; set; } = null!;

    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(BatchId))]
    public BatchDataModel Batch { get; set; } = null!;

    [ForeignKey(nameof(InspectorId))]
    public UserDataModel Inspector { get; set; } = null!;
}
