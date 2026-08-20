using System.Security.Claims;
using AgriTrace.API.Models;
using AgriTrace.Application.Features.Inspections;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgriTrace.API.Controllers;

[ApiController]
[Authorize]
public sealed class InspectionsController(ISender sender) : ControllerBase
{
    /// <summary>
    /// GET /batches/{batchId}/inspections - Lấy danh sách kiểm định của lô hàng.
    /// </summary>
    [HttpGet("api/v1/batches/{batchId:int}/inspections")]
    [HttpGet("api/batches/{batchId:int}/inspections")]
    [Authorize(Roles = "ADMIN,ORGADMIN,INSPECTOR")]
    public async Task<IActionResult> GetInspectionsByBatch(int batchId, CancellationToken ct)
    {
        var items = await sender.Send(new GetInspectionsByBatchQuery(batchId), ct);
        return Ok(ApiResponse.Ok(new { items }));
    }

    /// <summary>
    /// POST /batches/{batchId}/inspections - Tạo kiểm định mới (INSPECTOR). Tự động ghi event INSPECT.
    /// </summary>
    [HttpPost("api/v1/batches/{batchId:int}/inspections")]
    [HttpPost("api/batches/{batchId:int}/inspections")]
    [Authorize(Roles = "INSPECTOR,ADMIN")]
    public async Task<IActionResult> CreateInspection(int batchId, [FromBody] CreateInspectionRequest request, CancellationToken ct)
    {
        var inspectorId = GetCurrentUserId();
        var result = await sender.Send(new CreateInspectionCommand(batchId, inspectorId, request.Result, request.Notes), ct);
        return StatusCode(StatusCodes.Status201Created, ApiResponse.Created(result, "Kiểm định chất lượng thành công, sự kiện INSPECT đã được ghi nhận"));
    }

    /// <summary>
    /// GET /inspections/{inspectionId} - Lấy chi tiết kiểm định.
    /// </summary>
    [HttpGet("api/v1/inspections/{inspectionId:int}")]
    [HttpGet("api/inspections/{inspectionId:int}")]
    [Authorize(Roles = "ADMIN,INSPECTOR,ORGADMIN")]
    public async Task<IActionResult> GetInspectionById(int inspectionId, CancellationToken ct)
    {
        var result = await sender.Send(new GetInspectionByIdQuery(inspectionId), ct);
        return Ok(ApiResponse.Ok(result));
    }

    private int GetCurrentUserId()
    {
        var userIdStr = User.FindFirstValue("userId")
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");

        return int.TryParse(userIdStr, out var id) ? id : 1;
    }
}

public record CreateInspectionRequest(
    string Result,
    string? Notes);
