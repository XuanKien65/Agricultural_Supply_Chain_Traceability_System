using System.Security.Claims;
using AgriTrace.API.Models;
using AgriTrace.Application.Features.Auth.Commands;
using AgriTrace.Application.Features.Auth.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgriTrace.API.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController(ISender sender) : ControllerBase
{
    /// <summary>
    /// Đăng ký tài khoản mới.
    /// RoleId: 1=Admin, 2=Farmer, 3=Processor, 4=Distributor, 5=Retailer, 6=Inspector, 7=Consumer
    /// </summary>
    [HttpPost("register")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request, CancellationToken ct)
    {
        var result = await sender.Send(
            new RegisterCommand(request.Username, request.Email, request.Password,
                request.FullName, request.RoleId, request.OrganizationId), ct);

        return StatusCode(StatusCodes.Status201Created,
            ApiResponse.Success(result, System.Net.HttpStatusCode.Created));
    }

    /// <summary>
    /// Đăng nhập – trả về JWT Bearer token.
    /// Gắn token vào header: Authorization: Bearer {token}
    /// </summary>
    [HttpPost("login")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken ct)
    {
        var result = await sender.Send(new LoginCommand(request.Username, request.Password), ct);
        return Ok(ApiResponse.Success(result));
    }

    /// <summary>
    /// Lấy thông tin user hiện tại từ JWT token.
    /// Yêu cầu: Authorization: Bearer {token}
    /// </summary>
    [HttpGet("me")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Me(CancellationToken ct)
    {
        var userIdClaim = User.FindFirstValue("userId")
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!int.TryParse(userIdClaim, out var userId))
            return Unauthorized(ApiResponse.Fail(System.Net.HttpStatusCode.Unauthorized, "Invalid token claims."));

        var result = await sender.Send(new GetCurrentUserQuery(userId), ct);
        return Ok(ApiResponse.Success(result));
    }
}
