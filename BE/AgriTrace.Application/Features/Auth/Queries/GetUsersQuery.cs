using AgriTrace.Domain.Common;
using AgriTrace.Domain.Entities;
using AgriTrace.Domain.Interfaces;
using MediatR;

namespace AgriTrace.Application.Features.Auth.Queries;

// ---- Request DTO ----
public record GetUsersQuery(
    string? Search,
    string? RoleFilter,
    int Page = 1,
    int PageSize = 20) : IRequest<PagedResult<UserSummary>>;

// ---- Result DTO ----
public record UserSummary(
    int UserId,
    string Username,
    string Email,
    string? FullName,
    string Role,
    int? OrganizationId,
    string Status,
    DateTime CreatedAt);

// ---- Handler ----
public sealed class GetUsersQueryHandler(IUserRepository users)
    : IRequestHandler<GetUsersQuery, PagedResult<UserSummary>>
{
    public async Task<PagedResult<UserSummary>> Handle(GetUsersQuery request, CancellationToken cancellationToken)
    {
        var paged = await users.GetAllPagedAsync(
            request.Search, request.RoleFilter, request.Page, request.PageSize, cancellationToken);

        var summaries = paged.Items.Select(u => new UserSummary(
            UserId: u.Id,
            Username: u.Username,
            Email: u.Email,
            FullName: u.FullName,
            Role: u.RoleName ?? string.Empty,
            OrganizationId: u.OrganizationId,
            Status: u.Status,
            CreatedAt: u.CreatedAt)).ToList();

        return new PagedResult<UserSummary>(summaries.AsReadOnly(), paged.TotalCount);
    }
}
