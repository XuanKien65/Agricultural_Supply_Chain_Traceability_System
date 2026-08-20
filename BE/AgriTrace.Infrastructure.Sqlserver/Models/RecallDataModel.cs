using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AgriTrace.Infrastructure.Sqlserver.Models;

[Table("Recalls")]
public sealed class RecallDataModel
{
    [Key]
    public int Id { get; set; }

    public int BatchId { get; set; }

    [MaxLength(500)]
    public string? Reason { get; set; }

    [MaxLength(50)]
    public string? Severity { get; set; }

    public int CreatedBy { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [MaxLength(50)]
    public string Status { get; set; } = "ACTIVE";

    public DateTime? ResolvedAt { get; set; }

    public int? ResolvedBy { get; set; }

    [ForeignKey(nameof(BatchId))]
    public BatchDataModel Batch { get; set; } = null!;

    [ForeignKey(nameof(CreatedBy))]
    public UserDataModel Creator { get; set; } = null!;
}
