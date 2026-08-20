using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AgriTrace.Infrastructure.Sqlserver.Models;

[Table("SupplyChainEvents")]
public sealed class SupplyChainEventDataModel
{
    [Key]
    public int Id { get; set; }

    public int BatchId { get; set; }

    [Required, MaxLength(50)]
    public string EventType { get; set; } = null!;

    public int OrganizationId { get; set; }

    public int UserId { get; set; }

    public string? EventData { get; set; }

    [MaxLength(200)]
    public string? Location { get; set; }

    [MaxLength(500)]
    public string? PreviousHash { get; set; }

    [MaxLength(500)]
    public string? CurrentHash { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(BatchId))]
    public BatchDataModel Batch { get; set; } = null!;

    [ForeignKey(nameof(OrganizationId))]
    public OrganizationDataModel Organization { get; set; } = null!;

    [ForeignKey(nameof(UserId))]
    public UserDataModel User { get; set; } = null!;
}
