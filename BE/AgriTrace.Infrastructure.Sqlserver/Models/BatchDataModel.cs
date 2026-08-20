using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AgriTrace.Infrastructure.Sqlserver.Models;

[Table("Batches")]
public sealed class BatchDataModel
{
    [Key]
    public int Id { get; set; }

    public int ProductId { get; set; }

    [Required, MaxLength(100)]
    public string BatchCode { get; set; } = null!;

    public decimal Quantity { get; set; }

    public int? CurrentOrganizationId { get; set; }

    public int? ParentBatchId { get; set; }

    public int? RootBatchId { get; set; }

    [MaxLength(500)]
    public string? QRCode { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(ProductId))]
    public ProductDataModel Product { get; set; } = null!;

    [ForeignKey(nameof(CurrentOrganizationId))]
    public OrganizationDataModel? CurrentOrganization { get; set; }

    [ForeignKey(nameof(ParentBatchId))]
    public BatchDataModel? ParentBatch { get; set; }

    public List<SupplyChainEventDataModel> Events { get; set; } = [];
}
