using AgriTrace.Domain.Entities;
using AgriTrace.Domain.Interfaces;
using MediatR;

namespace AgriTrace.Application.Features.Auth.Commands;

// ---- Request DTO ----
public record RegisterCommand(
    string Username,
    string Email,
    string Password,
    string? FullName,
    int RoleId,
    int? OrganizationId) : IRequest<RegisterResult>;

// ---- Result DTO ----
public record RegisterResult(int UserId, string Username, string Email, string Role);

// ---- Handler ----
public sealed class RegisterCommandHandler(IUserRepository users) : IRequestHandler<RegisterCommand, RegisterResult>
{
    public async Task<RegisterResult> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        // Validate cơ bản
        if (string.IsNullOrWhiteSpace(request.Username))
            throw new ArgumentException("Tên đăng nhập không được để trống.");
        if (string.IsNullOrWhiteSpace(request.Email))
            throw new ArgumentException("Email không được để trống.");
        if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 6)
            throw new ArgumentException("Mật khẩu phải có ít nhất 6 ký tự.");

        // ❌ Không cho phép tự đăng ký tài khoản Admin qua public endpoint
        if (request.RoleId == 1)
            throw new InvalidOperationException("Không thể tự đăng ký tài khoản Quản trị viên (Admin).");

        // Check duplicate username & email
        if (await users.GetByUsernameAsync(request.Username, cancellationToken) is not null)
            throw new InvalidOperationException($"Tên tài khoản '{request.Username}' đã được sử dụng.");
        if (await users.GetByEmailAsync(request.Email, cancellationToken) is not null)
            throw new InvalidOperationException($"Địa chỉ Email '{request.Email}' đã được sử dụng.");

        // Hash password (BCrypt – logic ở Application vì BCrypt là library không phải EF)
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password, workFactor: 12);

        var now = DateTime.UtcNow;
        var user = new User(
            id: 0,
            roleId: request.RoleId,
            organizationId: request.OrganizationId,
            username: request.Username,
            passwordHash: passwordHash,
            email: request.Email,
            fullName: request.FullName,
            createdAt: now,
            status: User.StatusActive);

        var saved = await users.AddAsync(user, cancellationToken);
        return new RegisterResult(saved.Id, saved.Username, saved.Email, saved.RoleName ?? string.Empty);
    }
}
