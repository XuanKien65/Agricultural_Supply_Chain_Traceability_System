using AgriTrace.Application.Common.Exceptions;
using AgriTrace.Application.Contracts;
using AgriTrace.Domain.Interfaces;
using MediatR;

namespace AgriTrace.Application.Features.Admin;

public sealed record CreateAdminUserCommand(
    string? FullName,
    string Email,
    string? PasswordHash,
    string Role,
    int? OrganizationId,
    bool IsActive)
    : IRequest<AdminUserDto>;

public sealed record UpdateAdminUserCommand(
    int Id,
    string? FullName,
    string Email,
    string? PasswordHash,
    string Role,
    int? OrganizationId,
    bool IsActive)
    : IRequest<AdminUserDto>;

public sealed record DeactivateAdminUserCommand(int Id)
    : IRequest;

public sealed class CreateAdminUserCommandHandler(
    IAdminRepository repository)
    : IRequestHandler<CreateAdminUserCommand, AdminUserDto>
{
    public async Task<AdminUserDto> Handle(
        CreateAdminUserCommand request,
        CancellationToken cancellationToken)
    {
        var normalized =
            await AdminUserValidator.ValidateAsync(
                repository,
                request.Email,
                request.Role,
                request.OrganizationId,
                null,
                cancellationToken);

        var user =
            await repository.CreateUserAsync(
                request.FullName?.Trim(),
                normalized.Email,
                request.PasswordHash,
                normalized.Role,
                normalized.OrganizationId,
                request.IsActive,
                cancellationToken);

        return user.ToDto();
    }
}

public sealed class UpdateAdminUserCommandHandler(
    IAdminRepository repository)
    : IRequestHandler<UpdateAdminUserCommand, AdminUserDto>
{
    public async Task<AdminUserDto> Handle(
        UpdateAdminUserCommand request,
        CancellationToken cancellationToken)
    {
        var normalized =
            await AdminUserValidator.ValidateAsync(
                repository,
                request.Email,
                request.Role,
                request.OrganizationId,
                request.Id,
                cancellationToken);

        var user =
            await repository.UpdateUserAsync(
                request.Id,
                request.FullName?.Trim(),
                normalized.Email,
                request.PasswordHash,
                normalized.Role,
                normalized.OrganizationId,
                request.IsActive,
                cancellationToken);

        if (user is null)
            throw new NotFoundException(
                $"User '{request.Id}' not found.");

        return user.ToDto();
    }
}

public sealed class DeactivateAdminUserCommandHandler(
    IAdminRepository repository)
    : IRequestHandler<DeactivateAdminUserCommand>
{
    public async Task Handle(
        DeactivateAdminUserCommand request,
        CancellationToken cancellationToken)
    {
        if (!await repository.DeactivateUserAsync(
                request.Id,
                cancellationToken))
        {
            throw new NotFoundException(
                $"User '{request.Id}' not found.");
        }
    }
}

internal static class AdminUserValidator
{
    private static readonly Dictionary<string, string> AllowedRoles =
        new(StringComparer.OrdinalIgnoreCase)
        {
            ["ADMIN"] = "ADMIN",
            ["OrgAdmin"] = "OrgAdmin",
            ["FARMER"] = "FARMER",
            ["OPERATOR"] = "OPERATOR",
            ["INSPECTOR"] = "INSPECTOR"
        };

    public static async Task<(
        string Email,
        string Role,
        int? OrganizationId)> ValidateAsync(
        IAdminRepository repository,
        string email,
        string role,
        int? organizationId,
        int? exceptUserId,
        CancellationToken cancellationToken)
    {
        var normalizedEmail =
            email.Trim().ToLowerInvariant();

        if (string.IsNullOrWhiteSpace(normalizedEmail))
            throw new ArgumentException(
                "Email is required.");

        if (!AllowedRoles.TryGetValue(
                role.Trim(),
                out var normalizedRole))
        {
            throw new ArgumentException(
                "Role must be one of: ADMIN, OrgAdmin, FARMER, OPERATOR, INSPECTOR.");
        }

        if (await repository.EmailExistsAsync(
                normalizedEmail,
                exceptUserId,
                cancellationToken))
        {
            throw new ArgumentException(
                "Email already exists.");
        }

        if (organizationId.HasValue &&
            !await repository.OrganizationExistsAsync(
                organizationId.Value,
                cancellationToken))
        {
            throw new ArgumentException(
                "Organization does not exist.");
        }

        if (normalizedRole.Equals(
                "ADMIN",
                StringComparison.OrdinalIgnoreCase))
        {
            organizationId = null;
        }

        return (
            normalizedEmail,
            normalizedRole,
            organizationId);
    }
}