using AgriTrace.Domain.Entities;

namespace AgriTrace.Domain.Interfaces;

public interface IAdminRepository
{
    Task<AdminDashboard> GetDashboardAsync(
        CancellationToken cancellationToken = default);

    Task<IReadOnlyDictionary<string, int>> GetRoleCountsAsync(
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<AdminOrganization>> GetOrganizationsAsync(
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<AdminUser>> GetUsersAsync(
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<AdminProduct>> GetProductsAsync(
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<AdminBatch>> GetBatchesAsync(
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<AdminSupplyChainEvent>> GetEventsAsync(
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<AdminInspection>> GetInspectionsAsync(
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<AdminCertificate>> GetCertificatesAsync(
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<AdminRecall>> GetRecallsAsync(
        CancellationToken cancellationToken = default);

    Task<bool> EmailExistsAsync(
        string email,
        int? exceptUserId = null,
        CancellationToken cancellationToken = default);

    Task<bool> OrganizationExistsAsync(
        int organizationId,
        CancellationToken cancellationToken = default);

    Task<AdminUser?> GetUserByIdAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<AdminUser> CreateUserAsync(
        string? fullName,
        string email,
        string? passwordHash,
        string role,
        int? organizationId,
        bool isActive,
        CancellationToken cancellationToken = default);

    Task<AdminUser?> UpdateUserAsync(
        int id,
        string? fullName,
        string email,
        string? passwordHash,
        string role,
        int? organizationId,
        bool isActive,
        CancellationToken cancellationToken = default);

    Task<bool> DeactivateUserAsync(
        int id,
        CancellationToken cancellationToken = default);
}