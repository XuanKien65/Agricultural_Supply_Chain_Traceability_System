using AgriTrace.Application.Contracts;
using AgriTrace.Domain.Entities;

namespace AgriTrace.Application.Features.Admin;

internal static class AdminMapping
{
    public static AdminOrganizationDto ToDto(this AdminOrganization x) =>
        new(
            x.Id,
            x.Name,
            x.Type,
            x.Status,
            x.CreatedAt);

    public static AdminUserDto ToDto(this AdminUser x) =>
        new(
            x.Id,
            x.FullName,
            x.Email,
            x.Role,
            x.OrganizationId,
            x.OrganizationName,
            x.IsActive,
            x.CreatedAt);

    public static AdminProductDto ToDto(this AdminProduct x) =>
        new(
            x.Id,
            x.Name,
            x.Category,
            x.Unit,
            x.OrganizationId,
            x.OrganizationName);

    public static AdminBatchDto ToDto(this AdminBatch x) =>
        new(
            x.Id,
            x.ProductId,
            x.ProductName,
            x.BatchCode,
            x.Quantity,
            x.CurrentOrganizationId,
            x.CurrentOrganizationName,
            x.ParentBatchId,
            x.RootBatchId,
            x.QrCode,
            x.CreatedAt);

    public static AdminSupplyChainEventDto ToDto(
        this AdminSupplyChainEvent x) =>
        new(
            x.Id,
            x.BatchId,
            x.BatchCode,
            x.EventType,
            x.OrganizationId,
            x.OrganizationName,
            x.UserId,
            x.UserName,
            x.EventData,
            x.Location,
            x.PreviousHash,
            x.CurrentHash,
            x.CreatedAt);

    public static AdminInspectionDto ToDto(this AdminInspection x) =>
        new(
            x.Id,
            x.BatchId,
            x.BatchCode,
            x.InspectorId,
            x.InspectorName,
            x.Result,
            x.Notes,
            x.CreatedAt);

    public static AdminCertificateDto ToDto(this AdminCertificate x) =>
        new(
            x.Id,
            x.BatchId,
            x.BatchCode,
            x.InspectionId,
            x.CertificateType,
            x.FileUrl,
            x.IssuedAt);

    public static AdminRecallDto ToDto(this AdminRecall x) =>
        new(
            x.Id,
            x.BatchId,
            x.BatchCode,
            x.Reason,
            x.Severity,
            x.CreatedBy,
            x.CreatedByName,
            x.CreatedAt);
}