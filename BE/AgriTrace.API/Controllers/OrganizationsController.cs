using AgriTrace.API.Models;
using AgriTrace.Application.Features.Organizations;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgriTrace.API.Controllers;

[ApiController]
[Route("api/v1/organizations")]
[Authorize]
public sealed class OrganizationsController(ISender sender) : ControllerBase
{
    /// <summary>
    /// GET /organizations - Danh sách tổ chức (ADMIN).
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> GetOrganizations(
        [FromQuery] string? type,
        [FromQuery] string? status,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        var result = await sender.Send(new GetOrganizationsQuery(type, status, search, page, pageSize), ct);
        return Ok(ApiResponse.Ok(result));
    }

    /// <summary>
    /// GET /organizations/{organizationId} - Chi tiết tổ chức.
    /// </summary>
    [HttpGet("{organizationId:int}")]
    [Authorize(Roles = "ADMIN,ORGADMIN")]
    public async Task<IActionResult> GetOrganizationById(int organizationId, CancellationToken ct) =>
        Ok(ApiResponse.Ok(await sender.Send(new GetOrganizationByIdQuery(organizationId), ct)));

    /// <summary>
    /// POST /organizations - Tạo tổ chức mới (ADMIN).
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> CreateOrganization([FromBody] CreateOrganizationCommand command, CancellationToken ct)
    {
        var result = await sender.Send(command, ct);
        return CreatedAtAction(nameof(GetOrganizationById), new { organizationId = result.OrganizationId }, ApiResponse.Created(result, "Tạo tổ chức thành công"));
    }

    /// <summary>
    /// PUT /organizations/{organizationId} - Cập nhật thông tin tổ chức (ADMIN).
    /// </summary>
    [HttpPut("{organizationId:int}")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> UpdateOrganization(int organizationId, [FromBody] UpdateOrganizationRequest request, CancellationToken ct) =>
        Ok(ApiResponse.Ok(await sender.Send(new UpdateOrganizationCommand(organizationId, request.Name, request.Type), ct), "Cập nhật tổ chức thành công"));

    /// <summary>
    /// PATCH /organizations/{organizationId}/status - Cập nhật trạng thái tổ chức (ADMIN).
    /// </summary>
    [HttpPatch("{organizationId:int}/status")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> UpdateStatus(int organizationId, [FromBody] UpdateOrganizationStatusRequest request, CancellationToken ct)
    {
        await sender.Send(new UpdateOrganizationStatusCommand(organizationId, request.Status), ct);
        return Ok(ApiResponse.Ok(null, "Cập nhật trạng thái tổ chức thành công"));
    }
}

public record UpdateOrganizationRequest(string Name, string Type);
public record UpdateOrganizationStatusRequest(string Status);
