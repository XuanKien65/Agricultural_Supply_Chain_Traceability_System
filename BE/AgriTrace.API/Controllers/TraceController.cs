using AgriTrace.Application.Features.Trace.Queries;
using Microsoft.AspNetCore.RateLimiting;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgriTrace.API.Controllers;

/// <summary>
/// API Tra cứu công khai cho Người tiêu dùng.
/// Không yêu cầu đăng nhập — quét QR → xem hành trình lô hàng.
/// </summary>
[ApiController]
[Route("api/trace")]
[AllowAnonymous]
[EnableRateLimiting("PublicTrace")]
public sealed class TraceController(ISender sender) : ControllerBase
{
    /// <summary>
    /// Tra cứu công khai lô hàng theo BatchId.
    /// Trả về: Batch + Timeline Events + Inspections + Certificates + Hash Chain Verification.
    /// </summary>
    [HttpGet("{batchId}")]
    public async Task<IActionResult> GetPublicTrace(string batchId, CancellationToken ct) =>
        Ok(await sender.Send(new GetPublicTraceQuery(batchId), ct));

    [HttpGet("{batchId}/lineage")]
    public async Task<IActionResult> GetPublicLineage(string batchId, CancellationToken ct) =>
        Ok(await sender.Send(new GetPublicLineageQuery(batchId), ct));
}
