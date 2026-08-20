using AgriTrace.Application.Features.Trace.Queries;
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
public sealed class TraceController(ISender sender) : ControllerBase
{
    /// <summary>
    /// Tra cứu công khai lô hàng theo BatchId.
    /// Trả về: Batch + Timeline Events + Inspections + Certificates + Hash Chain Verification.
    /// </summary>
    [HttpGet("{batchId:int}")]
    public async Task<IActionResult> GetPublicTrace(int batchId, CancellationToken ct) =>
        Ok(await sender.Send(new GetPublicTraceQuery(batchId), ct));
}
