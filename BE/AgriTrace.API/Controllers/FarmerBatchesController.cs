using System.Security.Claims;
using AgriTrace.API.Models;
using AgriTrace.Application.Features.Batches.Commands;
using AgriTrace.Application.Features.Batches.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgriTrace.API.Controllers;
[ApiController, Route("api/farmer/batches"), Authorize(Roles = "FARMER,ADMIN")]
public sealed class FarmerBatchesController(ISender sender) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetBatches([FromQuery] int organizationId, [FromQuery] string? search,
        [FromQuery] string? status, [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default) =>
        Ok(await sender.Send(new GetFarmerBatchesQuery(ResolveOrganizationId(organizationId), search, status, page, pageSize), ct));

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetBatch(int id, [FromQuery] int organizationId, CancellationToken ct) =>
        Ok(await sender.Send(new GetFarmerBatchByIdQuery(id, ResolveOrganizationId(organizationId)), ct));

    [HttpPost]
    public async Task<IActionResult> CreateBatch(CreateFarmerBatchRequest request, CancellationToken ct)
    {
        var organizationId = ResolveOrganizationId(request.ProducerOrganizationId);
        var performedByUserId = ResolveUserId(request.PerformedByUserId);
        var result = await sender.Send(new CreateFarmerBatchCommand(request.ProductId, organizationId,
            performedByUserId, request.HarvestDate, request.Weight, request.Location, request.HarvestNotes), ct);
        return CreatedAtAction(nameof(GetBatch), new { id = result.BatchId, organizationId }, result);
    }

    /// <summary>
    /// FARMER chỉ được thao tác trên tổ chức của chính mình (lấy từ JWT) — bỏ qua giá trị
    /// client tự truyền để chặn IDOR (xem dữ liệu tổ chức khác qua đổi query string/body).
    /// ADMIN được giữ nguyên giá trị truyền vào vì cần quản trị nhiều tổ chức.
    /// </summary>
    private int ResolveOrganizationId(int requested)
    {
        if (User.IsInRole("ADMIN")) return requested;
        var claim = User.FindFirstValue("organizationId");
        return int.TryParse(claim, out var id) ? id : 0;
    }

    private int ResolveUserId(int requested)
    {
        if (User.IsInRole("ADMIN")) return requested;
        var claim = User.FindFirstValue("userId") ?? User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        return int.TryParse(claim, out var id) ? id : requested;
    }
}
