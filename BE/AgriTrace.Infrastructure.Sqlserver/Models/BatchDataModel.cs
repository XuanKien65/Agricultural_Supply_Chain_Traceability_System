namespace AgriTrace.Infrastructure.Sqlserver.Models;

public sealed class BatchDataModel
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public int ProducerOrganizationId { get; set; }
    public int? ParentBatchId { get; set; }
    public string QrCode { get; set; } = null!;
    public DateOnly? HarvestDate { get; set; }
    public decimal Weight { get; set; }
    public string Status { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public ProductDataModel Product { get; set; } = null!;
    public List<SupplyChainEventDataModel> Events { get; set; } = [];
}
