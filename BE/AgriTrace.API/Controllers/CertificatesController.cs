using AgriTrace.API.Models;
using AgriTrace.Application.Features.Certificates;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgriTrace.API.Controllers;

[ApiController]
[Authorize]
public sealed class CertificatesController(ISender sender) : ControllerBase
{
    /// <summary>
    /// GET /batches/{batchId}/certificates - Lấy danh sách chứng nhận của lô hàng.
    /// </summary>
    [HttpGet("api/v1/batches/{batchId:int}/certificates")]
    [HttpGet("api/batches/{batchId:int}/certificates")]
    [Authorize(Roles = "ADMIN,ORGADMIN,INSPECTOR")]
    public async Task<IActionResult> GetCertificatesByBatch(int batchId, CancellationToken ct)
    {
        var items = await sender.Send(new GetCertificatesByBatchQuery(batchId), ct);
        return Ok(ApiResponse.Ok(new { items }));
    }

    /// <summary>
    /// POST /batches/{batchId}/certificates - Cấp chứng nhận tiêu chuẩn (VietGAP, GlobalGAP...).
    /// </summary>
    [HttpPost("api/v1/batches/{batchId:int}/certificates")]
    [HttpPost("api/batches/{batchId:int}/certificates")]
    [Authorize(Roles = "INSPECTOR,ADMIN")]
    public async Task<IActionResult> CreateCertificate(int batchId, [FromBody] CreateCertificateRequest request, CancellationToken ct)
    {
        var result = await sender.Send(new CreateCertificateCommand(batchId, request.InspectionId, request.CertificateType, request.FileUrl), ct);
        return StatusCode(StatusCodes.Status201Created, ApiResponse.Created(result, "Cấp chứng nhận thành công"));
    }
}

public record CreateCertificateRequest(
    int? InspectionId,
    string CertificateType,
    string FileUrl);
