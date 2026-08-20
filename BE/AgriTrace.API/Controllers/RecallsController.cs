using System.Security.Claims;
using AgriTrace.API.Models;
using AgriTrace.Application.Features.Recalls;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgriTrace.API.Controllers;

[ApiController]
[Authorize]
public sealed class RecallsController(ISender sender) : ControllerBase
{
    /// <summary>
    /// GET /recalls - Lấy danh sách các lệnh thu hồi sản phẩm.
    /// </summary>
    [HttpGet("api/v1/recalls")]
    [HttpGet("api/recalls")]
    [Authorize(Roles = "ADMIN,INSPECTOR")]
    public async Task<IActionResult> GetRecalls(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        var result = await sender.Send(new GetRecallsQuery(page, pageSize), ct);
        return Ok(ApiResponse.Ok(result));
    }

    /// <summary>
    /// POST /recalls - Kích hoạt thu hồi lô hàng.
    /// </summary>
    [HttpPost("api/v1/recalls")]
    [HttpPost("api/recalls")]
    [Authorize(Roles = "ADMIN,INSPECTOR")]
    public async Task<IActionResult> CreateRecall([FromBody] CreateRecallRequest request, CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        var result = await sender.Send(new CreateRecallCommand(request.BatchId, request.Reason, request.Severity, userId), ct);
        return StatusCode(StatusCodes.Status201Created, ApiResponse.Created(result, "Kích hoạt thu hồi sản phẩm thành công"));
    }

    /// <summary>
    /// PATCH /recalls/{recallId}/resolve - Đánh dấu đã giải quyết thu hồi.
    /// </summary>
    [HttpPatch("api/v1/recalls/{recallId:int}/resolve")]
    [HttpPatch("api/recalls/{recallId:int}/resolve")]
    [Authorize(Roles = "ADMIN,INSPECTOR")]
    public async Task<IActionResult> ResolveRecall(int recallId, CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        var result = await sender.Send(new ResolveRecallCommand(recallId, userId), ct);
        return Ok(ApiResponse.Ok(result, "Đã giải quyết lệnh thu hồi thành công"));
    }

    private int GetCurrentUserId()
    {
        var userIdStr = User.FindFirstValue("userId")
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");

        return int.TryParse(userIdStr, out var id) ? id : 1;
    }
}

public record CreateRecallRequest(
    int BatchId,
    string Reason,
    string Severity);
