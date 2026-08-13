using AgriTrace.Domain.Interfaces;
using MediatR;

namespace AgriTrace.Application.Features.Auth.Commands;

// ---- Request DTO ----
public record LoginCommand(string Username, string Password) : IRequest<LoginResult>;

// ---- Result DTO ----
public record LoginResult(
    string Token,
    int UserId,
    string Username,
    string Email,
    string? FullName,
    string Role,
    int? OrganizationId,
    DateTime ExpiresAt);

// ---- Handler ----
public sealed class LoginCommandHandler(IUserRepository users, IJwtTokenService jwtService)
    : IRequestHandler<LoginCommand, LoginResult>
{
    public async Task<LoginResult> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Username))
            throw new ArgumentException("Vui lòng nhập tên đăng nhập hoặc Email.");
        if (string.IsNullOrWhiteSpace(request.Password))
            throw new ArgumentException("Vui lòng nhập mật khẩu.");

        var user = await users.GetByUsernameAsync(request.Username, cancellationToken)
            ?? throw new UnauthorizedAccessException("Tên đăng nhập hoặc mật khẩu không chính xác.");

        if (!user.IsActive)
            throw new UnauthorizedAccessException("Tài khoản đã bị khóa. Vui lòng liên hệ Quản trị viên.");

        bool isPasswordValid = false;
        try
        {
            isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
        }
        catch (BCrypt.Net.SaltParseException)
        {
            isPasswordValid = false;
        }

        if (!isPasswordValid)
            throw new UnauthorizedAccessException("Tên đăng nhập hoặc mật khẩu không chính xác.");

        var token = jwtService.GenerateToken(user);
        var expiresAt = DateTime.UtcNow.AddMinutes(60); // khớp với JwtSettings:ExpiryMinutes

        return new LoginResult(
            Token: token,
            UserId: user.Id,
            Username: user.Username,
            Email: user.Email,
            FullName: user.FullName,
            Role: user.RoleName ?? string.Empty,
            OrganizationId: user.OrganizationId,
            ExpiresAt: expiresAt);
    }
}
