using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AgriTrace.Infrastructure.Sqlserver.Models;

[Table("Certificates")]
public sealed class CertificateDataModel
{
    [Key]
    public int Id { get; set; }

    public int BatchId { get; set; }

    public int? InspectionId { get; set; }

    [Required, MaxLength(100)]
    public string CertificateType { get; set; } = null!;

    [Required, MaxLength(500)]
    public string FileUrl { get; set; } = null!;

    public DateTime IssuedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(BatchId))]
    public BatchDataModel Batch { get; set; } = null!;

    [ForeignKey(nameof(InspectionId))]
    public InspectionDataModel? Inspection { get; set; }
}
