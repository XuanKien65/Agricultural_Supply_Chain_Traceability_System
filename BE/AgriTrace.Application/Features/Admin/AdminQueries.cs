using AgriTrace.Application.Contracts;
using AgriTrace.Domain.Interfaces;
using MediatR;

namespace AgriTrace.Application.Features.Admin;

public sealed record GetAdminDashboardQuery
    : IRequest<AdminDashboardDto>;

public sealed record GetAdminRolesQuery
    : IRequest<IReadOnlyList<AdminRoleDto>>;

public sealed record GetAdminOrganizationsQuery
    : IRequest<IReadOnlyList<AdminOrganizationDto>>;

public sealed record GetAdminUsersQuery
    : IRequest<IReadOnlyList<AdminUserDto>>;

public sealed record GetAdminProductsQuery
    : IRequest<IReadOnlyList<AdminProductDto>>;

public sealed record GetAdminBatchesQuery
    : IRequest<IReadOnlyList<AdminBatchDto>>;

public sealed record GetAdminEventsQuery
    : IRequest<IReadOnlyList<AdminSupplyChainEventDto>>;

public sealed record GetAdminInspectionsQuery
    : IRequest<IReadOnlyList<AdminInspectionDto>>;

public sealed record GetAdminCertificatesQuery
    : IRequest<IReadOnlyList<AdminCertificateDto>>;

public sealed record GetAdminRecallsQuery
    : IRequest<IReadOnlyList<AdminRecallDto>>;


public sealed class GetAdminDashboardQueryHandler(
    IAdminRepository repository)
    : IRequestHandler<GetAdminDashboardQuery, AdminDashboardDto>
{
    public async Task<AdminDashboardDto> Handle(
        GetAdminDashboardQuery request,
        CancellationToken cancellationToken)
    {
        var x = await repository.GetDashboardAsync(cancellationToken);

        return new AdminDashboardDto(
            x.OrganizationCount,
            x.UserCount,
            x.BatchCount,
            x.RecallCount,
            x.RecentBatches.Select(b => b.ToDto()).ToList());
    }
}

public sealed class GetAdminRolesQueryHandler(
    IAdminRepository repository)
    : IRequestHandler<
        GetAdminRolesQuery,
        IReadOnlyList<AdminRoleDto>>
{
    private static readonly (
        string Name,
        string Description)[] DefaultRoles =
    [
        ("ADMIN", "Quản trị toàn bộ hệ thống"),
        ("OrgAdmin", "Quản trị người dùng và dữ liệu của một tổ chức"),
        ("FARMER", "Người dùng phía nông trại / sản xuất"),
        ("OPERATOR", "Nhân sự vận hành chuỗi cung ứng"),
        ("INSPECTOR", "Nhân sự kiểm định chất lượng")
    ];

    public async Task<IReadOnlyList<AdminRoleDto>> Handle(
        GetAdminRolesQuery request,
        CancellationToken cancellationToken)
    {
        var counts =
            await repository.GetRoleCountsAsync(cancellationToken);

        var result = new List<AdminRoleDto>();

        foreach (var role in DefaultRoles)
        {
            counts.TryGetValue(role.Name, out var count);

            result.Add(
                new AdminRoleDto(
                    role.Name,
                    role.Description,
                    count));
        }

        foreach (
            var role in counts.Keys.Where(
                name => DefaultRoles.All(
                    x => !x.Name.Equals(
                        name,
                        StringComparison.OrdinalIgnoreCase))))
        {
            result.Add(
                new AdminRoleDto(
                    role,
                    "Vai trò đang tồn tại trong cơ sở dữ liệu",
                    counts[role]));
        }

        return result;
    }
}

public sealed class GetAdminOrganizationsQueryHandler(
    IAdminRepository repository)
    : IRequestHandler<
        GetAdminOrganizationsQuery,
        IReadOnlyList<AdminOrganizationDto>>
{
    public async Task<IReadOnlyList<AdminOrganizationDto>> Handle(
        GetAdminOrganizationsQuery request,
        CancellationToken cancellationToken) =>
        (await repository.GetOrganizationsAsync(cancellationToken))
        .Select(x => x.ToDto())
        .ToList();
}

public sealed class GetAdminUsersQueryHandler(
    IAdminRepository repository)
    : IRequestHandler<
        GetAdminUsersQuery,
        IReadOnlyList<AdminUserDto>>
{
    public async Task<IReadOnlyList<AdminUserDto>> Handle(
        GetAdminUsersQuery request,
        CancellationToken cancellationToken) =>
        (await repository.GetUsersAsync(cancellationToken))
        .Select(x => x.ToDto())
        .ToList();
}

public sealed class GetAdminProductsQueryHandler(
    IAdminRepository repository)
    : IRequestHandler<
        GetAdminProductsQuery,
        IReadOnlyList<AdminProductDto>>
{
    public async Task<IReadOnlyList<AdminProductDto>> Handle(
        GetAdminProductsQuery request,
        CancellationToken cancellationToken) =>
        (await repository.GetProductsAsync(cancellationToken))
        .Select(x => x.ToDto())
        .ToList();
}

public sealed class GetAdminBatchesQueryHandler(
    IAdminRepository repository)
    : IRequestHandler<
        GetAdminBatchesQuery,
        IReadOnlyList<AdminBatchDto>>
{
    public async Task<IReadOnlyList<AdminBatchDto>> Handle(
        GetAdminBatchesQuery request,
        CancellationToken cancellationToken) =>
        (await repository.GetBatchesAsync(cancellationToken))
        .Select(x => x.ToDto())
        .ToList();
}

public sealed class GetAdminEventsQueryHandler(
    IAdminRepository repository)
    : IRequestHandler<
        GetAdminEventsQuery,
        IReadOnlyList<AdminSupplyChainEventDto>>
{
    public async Task<IReadOnlyList<AdminSupplyChainEventDto>> Handle(
        GetAdminEventsQuery request,
        CancellationToken cancellationToken) =>
        (await repository.GetEventsAsync(cancellationToken))
        .Select(x => x.ToDto())
        .ToList();
}

public sealed class GetAdminInspectionsQueryHandler(
    IAdminRepository repository)
    : IRequestHandler<
        GetAdminInspectionsQuery,
        IReadOnlyList<AdminInspectionDto>>
{
    public async Task<IReadOnlyList<AdminInspectionDto>> Handle(
        GetAdminInspectionsQuery request,
        CancellationToken cancellationToken) =>
        (await repository.GetInspectionsAsync(cancellationToken))
        .Select(x => x.ToDto())
        .ToList();
}

public sealed class GetAdminCertificatesQueryHandler(
    IAdminRepository repository)
    : IRequestHandler<
        GetAdminCertificatesQuery,
        IReadOnlyList<AdminCertificateDto>>
{
    public async Task<IReadOnlyList<AdminCertificateDto>> Handle(
        GetAdminCertificatesQuery request,
        CancellationToken cancellationToken) =>
        (await repository.GetCertificatesAsync(cancellationToken))
        .Select(x => x.ToDto())
        .ToList();
}

public sealed class GetAdminRecallsQueryHandler(
    IAdminRepository repository)
    : IRequestHandler<
        GetAdminRecallsQuery,
        IReadOnlyList<AdminRecallDto>>
{
    public async Task<IReadOnlyList<AdminRecallDto>> Handle(
        GetAdminRecallsQuery request,
        CancellationToken cancellationToken) =>
        (await repository.GetRecallsAsync(cancellationToken))
        .Select(x => x.ToDto())
        .ToList();
}