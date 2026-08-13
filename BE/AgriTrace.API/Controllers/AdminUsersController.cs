using AgriTrace.API.Models;
using AgriTrace.Application.Features.Auth.Commands;
using AgriTrace.Application.Features.Auth.Queries;
using AgriTrace.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgriTrace.API.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = Role.Admin)]
public sealed class AdminUsersController(ISender sender) : ControllerBase
{
    /// <summary>
    /// [Admin only] Lấy danh sách tất cả users có phân trang, filter theo role và search.
    /// </summary>
    [HttpGet("users")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetUsers(
        [FromQuery] string? search,
        [FromQuery] string? role,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        var result = await sender.Send(new GetUsersQuery(search, role, page, pageSize), ct);
        return Ok(ApiResponse.Success(result));
    }

    /// <summary>
    /// [Admin only] Khoá hoặc mở khoá tài khoản user.
    /// Status: "Active" | "Inactive"
    /// </summary>
    [HttpPut("users/{id:int}/status")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateUserStatus(int id, [FromBody] UpdateUserStatusRequest request, CancellationToken ct)
    {
        await sender.Send(new UpdateUserStatusCommand(id, request.Status), ct);
        return Ok(ApiResponse.Success(new { message = $"User {id} status updated to '{request.Status}'." }));
    }

    /// <summary>
    /// [Admin only] Tạo tài khoản mới với BẤT KỲ role nào, kể cả Admin.
    /// Đây là endpoint duy nhất có thể tạo tài khoản Admin.
    /// RoleId: 1=Admin | 2=Farmer | 3=Processor | 4=Distributor | 5=Retailer | 6=Inspector | 7=Consumer
    /// </summary>
    [HttpPost("users/create")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateUser([FromBody] RegisterRequest request, CancellationToken ct)
    {
        var result = await sender.Send(
            new CreateUserByAdminCommand(
                request.Username, request.Email, request.Password,
                request.FullName, request.RoleId, request.OrganizationId), ct);

        return StatusCode(StatusCodes.Status201Created,
            ApiResponse.Success(result, System.Net.HttpStatusCode.Created));
    }
}
