using AgriTrace.API.Models;
using AgriTrace.Application.Features.Users;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgriTrace.API.Controllers;

[ApiController]
[Route("api/v1/users")]
[Authorize]
public sealed class UsersController(ISender sender) : ControllerBase
{
    /// <summary>
    /// GET /users - Danh sách người dùng.
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "ADMIN,ORGADMIN")]
    public async Task<IActionResult> GetUsers(
        [FromQuery] int? organizationId,
        [FromQuery] string? role,
        [FromQuery] bool? isActive,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        var result = await sender.Send(new GetUsersQuery(organizationId, role, isActive, search, page, pageSize), ct);
        return Ok(ApiResponse.Ok(result));
    }

    /// <summary>
    /// GET /users/{userId} - Chi tiết người dùng.
    /// </summary>
    [HttpGet("{userId:int}")]
    [Authorize(Roles = "ADMIN,ORGADMIN")]
    public async Task<IActionResult> GetUserById(int userId, CancellationToken ct) =>
        Ok(ApiResponse.Ok(await sender.Send(new GetUserByIdQuery(userId), ct)));

    /// <summary>
    /// POST /users - Tạo người dùng mới.
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "ADMIN,ORGADMIN")]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserCommand command, CancellationToken ct)
    {
        var result = await sender.Send(command, ct);
        return CreatedAtAction(nameof(GetUserById), new { userId = result.UserId }, ApiResponse.Created(result, "Tạo người dùng thành công"));
    }

    /// <summary>
    /// PUT /users/{userId} - Cập nhật người dùng.
    /// </summary>
    [HttpPut("{userId:int}")]
    [Authorize(Roles = "ADMIN,ORGADMIN")]
    public async Task<IActionResult> UpdateUser(int userId, [FromBody] UpdateUserRequest request, CancellationToken ct) =>
        Ok(ApiResponse.Ok(await sender.Send(new UpdateUserCommand(userId, request.FullName, request.Role), ct), "Cập nhật người dùng thành công"));

    /// <summary>
    /// PATCH /users/{userId}/status - Kích hoạt / Vô hiệu hóa người dùng.
    /// </summary>
    [HttpPatch("{userId:int}/status")]
    [Authorize(Roles = "ADMIN,ORGADMIN")]
    public async Task<IActionResult> UpdateUserStatus(int userId, [FromBody] UpdateUserStatusRequest request, CancellationToken ct)
    {
        await sender.Send(new UpdateUserStatusCommand(userId, request.IsActive), ct);
        return Ok(ApiResponse.Ok(null, "Cập nhật trạng thái tài khoản thành công"));
    }
}

public record UpdateUserRequest(string? FullName, string Role);
public record UpdateUserStatusRequest(bool IsActive);
