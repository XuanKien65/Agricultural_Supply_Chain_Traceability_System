using System.Security.Claims;
using AgriTrace.Application.Features.Batches.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgriTrace.API.Controllers;
[ApiController, Route("api/farmer/dashboard"), Authorize(Roles = "FARMER,ADMIN")]
public sealed class FarmerDashboardController(ISender sender) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetDashboard([FromQuery] int organizationId, CancellationToken cancellationToken) =>
        Ok(await sender.Send(new GetFarmerDashboardQuery(ResolveOrganizationId(organizationId)), cancellationToken));

    /// <summary>FARMER chỉ xem được tổ chức của chính mình (JWT) — chặn IDOR qua query string.</summary>
    private int ResolveOrganizationId(int requested)
    {
        if (User.IsInRole("ADMIN")) return requested;
        var claim = User.FindFirstValue("organizationId");
        return int.TryParse(claim, out var id) ? id : 0;
    }
}
