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
        Ok(await sender.Send(new GetFarmerDashboardQuery(organizationId), cancellationToken));
}
