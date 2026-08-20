using AgriTrace.API.Models;
using AgriTrace.Application.Features.PublicTrace;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgriTrace.API.Controllers;

/// <summary>
/// Tra cứu công khai cho Người tiêu dùng (Consumer / Mobile QR Scan).
/// Tích hợp Redis Cache (TTL 5 phút).
/// </summary>
[ApiController]
[AllowAnonymous]
public sealed class PublicTraceController(ISender sender) : ControllerBase
{
    /// <summary>
    /// GET /public/trace/{batchId} - Tra cứu thông tin toàn bộ lô hàng theo BatchId / QR.
    /// Bao gồm thông tin sản phẩm, timeline sự kiện, chứng nhận VietGAP, kiểm định, cảnh báo thu hồi.
    /// </summary>
    [HttpGet("api/v1/public/trace/{batchId:int}")]
    [HttpGet("api/public/trace/{batchId:int}")]
    [HttpGet("public/trace/{batchId:int}")]
    public async Task<IActionResult> GetPublicTrace(int batchId, CancellationToken ct)
    {
        var result = await sender.Send(new GetPublicTraceQuery(batchId), ct);
        return Ok(ApiResponse.Ok(result));
    }

    /// <summary>
    /// GET /public/trace/{batchId}/lineage - Lấy sơ đồ cây phả hệ tách/gộp của lô hàng.
    /// </summary>
    [HttpGet("api/v1/public/trace/{batchId:int}/lineage")]
    [HttpGet("api/public/trace/{batchId:int}/lineage")]
    [HttpGet("public/trace/{batchId:int}/lineage")]
    public async Task<IActionResult> GetBatchLineage(int batchId, CancellationToken ct)
    {
        var result = await sender.Send(new GetBatchLineageQuery(batchId), ct);
        return Ok(ApiResponse.Ok(result));
    }
}
