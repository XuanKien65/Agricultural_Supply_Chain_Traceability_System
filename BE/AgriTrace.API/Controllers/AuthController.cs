using System.Security.Claims;
using AgriTrace.API.Models;
using AgriTrace.Application.Features.Auth.Commands;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgriTrace.API.Controllers;

[ApiController]
[Route("api/v1/auth")]
public sealed class AuthController(ISender sender) : ControllerBase
{
    /// <summary>
    /// POST /auth/login - Đăng nhập tài khoản.
    /// </summary>
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginCommand command, CancellationToken ct) =>
        Ok(ApiResponse.Ok(await sender.Send(command, ct), "Đăng nhập thành công"));

    /// <summary>
    /// POST /auth/refresh-token - Cấp lại access token bằng refresh token.
    /// </summary>
    [HttpPost("refresh-token")]
    [AllowAnonymous]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenCommand command, CancellationToken ct) =>
        Ok(ApiResponse.Ok(await sender.Send(command, ct), "Cấp mới token thành công"));

    /// <summary>
    /// POST /auth/logout - Đăng xuất tài khoản.
    /// </summary>
    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout([FromBody] LogoutCommand command, CancellationToken ct)
    {
        await sender.Send(command, ct);
        return NoContent();
    }

    /// <summary>
    /// GET /auth/me - Lấy thông tin tài khoản hiện tại.
    /// </summary>
    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetMe(CancellationToken ct)
    {
        var userIdStr = User.FindFirstValue("userId")
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");

        if (!int.TryParse(userIdStr, out var userId))
            return Unauthorized(ApiResponse.Fail("Token không hợp lệ."));

        return Ok(ApiResponse.Ok(await sender.Send(new GetCurrentUserQuery(userId), ct)));
    }

    /// <summary>
    /// PUT /auth/change-password - Đổi mật khẩu.
    /// </summary>
    [HttpPut("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request, CancellationToken ct)
    {
        var userIdStr = User.FindFirstValue("userId")
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");

        if (!int.TryParse(userIdStr, out var userId))
            return Unauthorized(ApiResponse.Fail("Token không hợp lệ."));

        await sender.Send(new ChangePasswordCommand(userId, request.CurrentPassword, request.NewPassword, request.ConfirmNewPassword), ct);
        return Ok(ApiResponse.Ok(null, "Đổi mật khẩu thành công"));
    }
}

public record ChangePasswordRequest(string CurrentPassword, string NewPassword, string ConfirmNewPassword);
