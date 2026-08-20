using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AgriTrace.Infrastructure.Sqlserver.Models;

[Table("BatchRelations")]
public sealed class BatchRelationDataModel
{
    [Key]
    public int Id { get; set; }

    public int SourceBatchId { get; set; }

    public int TargetBatchId { get; set; }

    [MaxLength(50)]
    public string? RelationType { get; set; }

    public decimal? Quantity { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(SourceBatchId))]
    public BatchDataModel SourceBatch { get; set; } = null!;

    [ForeignKey(nameof(TargetBatchId))]
    public BatchDataModel TargetBatch { get; set; } = null!;
}
