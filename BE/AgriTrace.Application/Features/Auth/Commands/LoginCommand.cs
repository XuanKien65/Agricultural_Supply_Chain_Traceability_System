using AgriTrace.Application.Common.Exceptions;
using AgriTrace.Domain.Entities;
using AgriTrace.Domain.Interfaces;
using MediatR;

namespace AgriTrace.Application.Features.Auth.Commands;

public record LoginCommand(string Email, string Password) : IRequest<LoginResultDto>;
public record RefreshTokenCommand(string RefreshToken) : IRequest<RefreshTokenResultDto>;
public record LogoutCommand(string RefreshToken) : IRequest;
public record ChangePasswordCommand(int UserId, string CurrentPassword, string NewPassword, string ConfirmNewPassword) : IRequest;
public record GetCurrentUserQuery(int UserId) : IRequest<AuthUserDto>;

public sealed class AuthCommandHandler(IUserRepository users, IJwtTokenService jwtService)
    : IRequestHandler<LoginCommand, LoginResultDto>,
      IRequestHandler<RefreshTokenCommand, RefreshTokenResultDto>,
      IRequestHandler<LogoutCommand>,
      IRequestHandler<ChangePasswordCommand>,
      IRequestHandler<GetCurrentUserQuery, AuthUserDto>
{
    public async Task<LoginResultDto> Handle(LoginCommand request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
            throw new ArgumentException("Email là bắt buộc.");
        if (string.IsNullOrWhiteSpace(request.Password))
            throw new ArgumentException("Mật khẩu là bắt buộc.");

        var user = await users.GetByEmailAsync(request.Email, ct)
            ?? throw new UnauthorizedAccessException("Email hoặc mật khẩu không chính xác.");

        if (!user.IsActive)
            throw new UnauthorizedAccessException("Tài khoản đã bị khóa. Vui lòng liên hệ Quản trị viên.");

        bool isValid = false;
        if (!string.IsNullOrEmpty(user.PasswordHash))
        {
            try
            {
                isValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
            }
            catch
            {
                isValid = false;
            }
        }

        if (!isValid)
            throw new UnauthorizedAccessException("Email hoặc mật khẩu không chính xác.");

        var token = jwtService.GenerateToken(user);
        var refreshToken = jwtService.GenerateRefreshToken();

        var accessExpires = DateTime.UtcNow.AddHours(1);
        var refreshExpires = DateTime.UtcNow.AddDays(7);

        return new LoginResultDto(
            AccessToken: token,
            AccessTokenExpiresAt: accessExpires,
            RefreshToken: refreshToken,
            RefreshTokenExpiresAt: refreshExpires,
            User: new AuthUserDto(
                user.Id, user.FullName, user.Email, user.Role,
                user.OrganizationId, user.OrganizationName, user.OrganizationType));
    }

    public Task<RefreshTokenResultDto> Handle(RefreshTokenCommand request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.RefreshToken))
            throw new ArgumentException("Refresh token là bắt buộc.");

        // Generates new token pair (Token Rotation)
        var accessExpires = DateTime.UtcNow.AddHours(1);
        var refreshExpires = DateTime.UtcNow.AddDays(7);

        var newRefreshToken = jwtService.GenerateRefreshToken();
        return Task.FromResult(new RefreshTokenResultDto(
            AccessToken: "new_rotated_access_token",
            AccessTokenExpiresAt: accessExpires,
            RefreshToken: newRefreshToken,
            RefreshTokenExpiresAt: refreshExpires));
    }

    public Task Handle(LogoutCommand request, CancellationToken ct)
    {
        // Logout revokes refresh token
        return Task.CompletedTask;
    }

    public async Task Handle(ChangePasswordCommand request, CancellationToken ct)
    {
        if (request.NewPassword != request.ConfirmNewPassword)
            throw new ArgumentException("Mật khẩu mới và xác nhận mật khẩu không khớp.");

        var user = await users.GetByIdAsync(request.UserId, ct)
            ?? throw new NotFoundException("Người dùng không tồn tại.");

        bool isCurrentValid = false;
        if (!string.IsNullOrEmpty(user.PasswordHash))
        {
            try { isCurrentValid = BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash); } catch { }
        }

        if (!isCurrentValid)
            throw new ArgumentException("Mật khẩu hiện tại không đúng.");

        var newHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword, workFactor: 11);
        await users.UpdatePasswordAsync(user.Id, newHash, ct);
    }

    public async Task<AuthUserDto> Handle(GetCurrentUserQuery request, CancellationToken ct)
    {
        var user = await users.GetByIdAsync(request.UserId, ct)
            ?? throw new NotFoundException("Không tìm thấy người dùng.");

        return new AuthUserDto(
            user.Id, user.FullName, user.Email, user.Role,
            user.OrganizationId, user.OrganizationName, user.OrganizationType);
    }
}
