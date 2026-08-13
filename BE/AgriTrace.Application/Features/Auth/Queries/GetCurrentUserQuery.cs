using AgriTrace.Domain.Entities;
using AgriTrace.Domain.Interfaces;
using MediatR;

namespace AgriTrace.Application.Features.Auth.Queries;

// ---- Request DTO ----
public record GetCurrentUserQuery(int UserId) : IRequest<CurrentUserResult>;

// ---- Result DTO ----
public record CurrentUserResult(
    int UserId,
    string Username,
    string Email,
    string? FullName,
    string Role,
    int? OrganizationId,
    string Status,
    DateTime CreatedAt);

// ---- Handler ----
public sealed class GetCurrentUserQueryHandler(IUserRepository users)
    : IRequestHandler<GetCurrentUserQuery, CurrentUserResult>
{
    public async Task<CurrentUserResult> Handle(GetCurrentUserQuery request, CancellationToken cancellationToken)
    {
        var user = await users.GetByIdAsync(request.UserId, cancellationToken)
            ?? throw new InvalidOperationException("User not found.");

        return new CurrentUserResult(
            UserId: user.Id,
            Username: user.Username,
            Email: user.Email,
            FullName: user.FullName,
            Role: user.RoleName ?? string.Empty,
            OrganizationId: user.OrganizationId,
            Status: user.Status,
            CreatedAt: user.CreatedAt);
    }
}
