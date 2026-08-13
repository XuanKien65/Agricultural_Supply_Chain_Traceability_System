using AgriTrace.Domain.Entities;
using AgriTrace.Domain.Interfaces;
using MediatR;

namespace AgriTrace.Application.Features.Auth.Commands;

// ---- Request DTO ----
/// <summary>
/// Chỉ Admin mới được gọi command này (kiểm tra tại Controller level).
/// Admin có thể tạo tài khoản với BẤT KỲ role nào, kể cả Admin khác.
/// </summary>
public record CreateUserByAdminCommand(
    string Username,
    string Email,
    string Password,
    string? FullName,
    int RoleId,
    int? OrganizationId) : IRequest<RegisterResult>;

// ---- Handler ----
public sealed class CreateUserByAdminCommandHandler(IUserRepository users)
    : IRequestHandler<CreateUserByAdminCommand, RegisterResult>
{
    public async Task<RegisterResult> Handle(CreateUserByAdminCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Username))
            throw new ArgumentException("Username is required.");
        if (string.IsNullOrWhiteSpace(request.Email))
            throw new ArgumentException("Email is required.");
        if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 6)
            throw new ArgumentException("Password must be at least 6 characters.");
        if (request.RoleId < 1 || request.RoleId > 7)
            throw new ArgumentException("Invalid RoleId. Must be between 1 (Admin) and 7 (Consumer).");

        // Check duplicate
        if (await users.GetByUsernameAsync(request.Username, cancellationToken) is not null)
            throw new InvalidOperationException($"Username '{request.Username}' is already taken.");
        if (await users.GetByEmailAsync(request.Email, cancellationToken) is not null)
            throw new InvalidOperationException($"Email '{request.Email}' is already registered.");

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password, workFactor: 12);

        var user = new User(
            id: 0,
            roleId: request.RoleId,
            organizationId: request.OrganizationId,
            username: request.Username,
            passwordHash: passwordHash,
            email: request.Email,
            fullName: request.FullName,
            createdAt: DateTime.UtcNow,
            status: User.StatusActive);

        var saved = await users.AddAsync(user, cancellationToken);
        return new RegisterResult(saved.Id, saved.Username, saved.Email, saved.RoleName ?? string.Empty);
    }
}
