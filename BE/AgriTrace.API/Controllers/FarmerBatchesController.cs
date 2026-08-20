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
        Ok(await sender.Send(new GetFarmerBatchesQuery(organizationId, search, status, page, pageSize), ct));

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetBatch(int id, [FromQuery] int organizationId, CancellationToken ct) =>
        Ok(await sender.Send(new GetFarmerBatchByIdQuery(id, organizationId), ct));

    [HttpPost]
    public async Task<IActionResult> CreateBatch(CreateFarmerBatchRequest request, CancellationToken ct)
    {
        var result = await sender.Send(new CreateFarmerBatchCommand(request.ProductId, request.ProducerOrganizationId,
            request.PerformedByUserId, request.HarvestDate, request.Weight, request.Location, request.HarvestNotes), ct);
        return CreatedAtAction(nameof(GetBatch), new { id = result.BatchId, organizationId = request.ProducerOrganizationId }, result);
    }
}
