using AgriTrace.API.Models;
using AgriTrace.Application.Features.Lookup;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgriTrace.API.Controllers;

[ApiController]
[Route("api/v1")]
[AllowAnonymous]
public sealed class LookupController(ISender sender) : ControllerBase
{
    /// <summary>
    /// GET /roles - Danh sách vai trò người dùng hệ thống.
    /// </summary>
    [HttpGet("roles")]
    public async Task<IActionResult> GetRoles(CancellationToken ct) =>
        Ok(ApiResponse.Ok(await sender.Send(new GetRolesQuery(), ct)));

    /// <summary>
    /// GET /organization-types - Danh sách các loại tổ chức.
    /// </summary>
    [HttpGet("organization-types")]
    public async Task<IActionResult> GetOrganizationTypes(CancellationToken ct) =>
        Ok(ApiResponse.Ok(await sender.Send(new GetOrganizationTypesQuery(), ct)));

    /// <summary>
    /// GET /event-types - Danh sách các loại sự kiện chuỗi cung ứng.
    /// </summary>
    [HttpGet("event-types")]
    public async Task<IActionResult> GetEventTypes(CancellationToken ct) =>
        Ok(ApiResponse.Ok(await sender.Send(new GetEventTypesQuery(), ct)));
}
