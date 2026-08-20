using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AgriTrace.Infrastructure.Sqlserver.Models;

[Table("BatchImages")]
public sealed class BatchImageDataModel
{
    [Key]
    public int Id { get; set; }

    public int BatchId { get; set; }

    [Required, MaxLength(500)]
    public string ImageUrl { get; set; } = null!;

    [MaxLength(200)]
    public string? Caption { get; set; }

    public int DisplayOrder { get; set; }

    public int? EventId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(BatchId))]
    public BatchDataModel Batch { get; set; } = null!;

    [ForeignKey(nameof(EventId))]
    public SupplyChainEventDataModel? Event { get; set; }
}
