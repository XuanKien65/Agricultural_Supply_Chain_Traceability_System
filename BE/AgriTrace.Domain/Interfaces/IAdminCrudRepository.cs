using AgriTrace.Domain.Entities;

namespace AgriTrace.Domain.Interfaces;

public interface IAdminCrudRepository
{
    Task<AdminOrganization> CreateOrganizationAsync(
        string name,
        string type,
        string status,
        CancellationToken ct = default);

    Task<AdminOrganization?> UpdateOrganizationAsync(
        int id,
        string name,
        string type,
        string status,
        CancellationToken ct = default);

    Task<bool> DeactivateOrganizationAsync(
        int id,
        CancellationToken ct = default);


    Task<AdminProduct> CreateProductAsync(
        string? name,
        string? category,
        string? unit,
        int organizationId,
        CancellationToken ct = default);

    Task<AdminProduct?> UpdateProductAsync(
        int id,
        string? name,
        string? category,
        string? unit,
        int organizationId,
        CancellationToken ct = default);

    Task<bool> DeleteProductAsync(
        int id,
        CancellationToken ct = default);


    Task<AdminBatch> CreateBatchAsync(
        int productId,
        string batchCode,
        decimal quantity,
        int? currentOrganizationId,
        int? parentBatchId,
        int? rootBatchId,
        string? qrCode,
        CancellationToken ct = default);

    Task<AdminBatch?> UpdateBatchAsync(
        int id,
        int productId,
        string batchCode,
        decimal quantity,
        int? currentOrganizationId,
        int? parentBatchId,
        int? rootBatchId,
        string? qrCode,
        CancellationToken ct = default);

    Task<bool> DeleteBatchAsync(
        int id,
        CancellationToken ct = default);


    Task<AdminSupplyChainEvent> CreateEventAsync(
        int batchId,
        string eventType,
        int organizationId,
        int userId,
        string? eventData,
        string? location,
        string? previousHash,
        string? currentHash,
        CancellationToken ct = default);


    Task<AdminInspection> CreateInspectionAsync(
        int batchId,
        int inspectorId,
        string? result,
        string? notes,
        CancellationToken ct = default);

    Task<AdminInspection?> UpdateInspectionAsync(
        int id,
        int batchId,
        int inspectorId,
        string? result,
        string? notes,
        CancellationToken ct = default);

    Task<bool> DeleteInspectionAsync(
        int id,
        CancellationToken ct = default);


    Task<AdminCertificate> CreateCertificateAsync(
        int batchId,
        int? inspectionId,
        string? certificateType,
        string? fileUrl,
        CancellationToken ct = default);

    Task<AdminCertificate?> UpdateCertificateAsync(
        int id,
        int batchId,
        int? inspectionId,
        string? certificateType,
        string? fileUrl,
        CancellationToken ct = default);

    Task<bool> DeleteCertificateAsync(
        int id,
        CancellationToken ct = default);


    Task<AdminRecall> CreateRecallAsync(
        int batchId,
        string? reason,
        string? severity,
        int createdBy,
        CancellationToken ct = default);

    Task<AdminRecall?> UpdateRecallAsync(
        int id,
        int batchId,
        string? reason,
        string? severity,
        int createdBy,
        CancellationToken ct = default);

    Task<bool> DeleteRecallAsync(
        int id,
        CancellationToken ct = default);
}