using System.Security.Claims;
using AgriTrace.API.Models;
using AgriTrace.Application.Features.Analytics;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgriTrace.API.Controllers;

/// <summary>
/// Thống kê Dashboard, phân bổ chuỗi cung ứng, thời gian xử lý và truy vết ngược.
/// </summary>
[ApiController]
[Authorize]
public sealed class AnalyticsController(ISender sender) : ControllerBase
{
    /// <summary>
    /// GET /analytics/overview - Tổng quan số liệu toàn hệ thống (ADMIN).
    /// </summary>
    [HttpGet("api/v1/analytics/overview")]
    [HttpGet("api/analytics/overview")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> GetOverview(CancellationToken ct)
    {
        var result = await sender.Send(new GetOverviewAnalyticsQuery(), ct);
        return Ok(ApiResponse.Ok(result));
    }

    /// <summary>
    /// GET /analytics/batch-distribution - Thống kê phân bổ lô hàng theo tổ chức (ADMIN, ORGADMIN).
    /// </summary>
    [HttpGet("api/v1/analytics/batch-distribution")]
    [HttpGet("api/analytics/batch-distribution")]
    [Authorize(Roles = "ADMIN,ORGADMIN")]
    public async Task<IActionResult> GetBatchDistribution(CancellationToken ct)
    {
        var userRole = User.FindFirstValue(ClaimTypes.Role) ?? User.FindFirstValue("role");
        int? orgId = null;

        if (userRole == "ORGADMIN")
        {
            orgId = GetCurrentOrganizationId();
        }

        var result = await sender.Send(new GetBatchDistributionQuery(orgId), ct);
        return Ok(ApiResponse.Ok(result));
    }

    /// <summary>
    /// GET /analytics/processing-time - Thời gian xử lý trung bình giữa các công đoạn (ADMIN, ORGADMIN).
    /// </summary>
    [HttpGet("api/v1/analytics/processing-time")]
    [HttpGet("api/analytics/processing-time")]
    [Authorize(Roles = "ADMIN,ORGADMIN")]
    public async Task<IActionResult> GetProcessingTime(CancellationToken ct)
    {
        var userRole = User.FindFirstValue(ClaimTypes.Role) ?? User.FindFirstValue("role");
        int? orgId = null;

        if (userRole == "ORGADMIN")
        {
            orgId = GetCurrentOrganizationId();
        }

        var result = await sender.Send(new GetProcessingTimeQuery(orgId), ct);
        return Ok(ApiResponse.Ok(result));
    }

    /// <summary>
    /// GET /analytics/traceback/{batchId} - Truy vết ngược nguồn gốc lô hàng (ADMIN, INSPECTOR).
    /// </summary>
    [HttpGet("api/v1/analytics/traceback/{batchId:int}")]
    [HttpGet("api/analytics/traceback/{batchId:int}")]
    [Authorize(Roles = "ADMIN,INSPECTOR")]
    public async Task<IActionResult> GetTraceback(int batchId, CancellationToken ct)
    {
        var result = await sender.Send(new GetTracebackQuery(batchId), ct);
        return Ok(ApiResponse.Ok(result));
    }

    private int? GetCurrentOrganizationId()
    {
        var orgIdStr = User.FindFirstValue("organizationId");
        return int.TryParse(orgIdStr, out var id) ? id : null;
    }
}
