using System.Net;
using AgriTrace.API.Models;
using AgriTrace.Application.Features.Batches.Queries;
using AgriTrace.Application.Features.Events.Commands;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace AgriTrace.API.Controllers;
[ApiController, Route("api/batches")]
public sealed class BatchEventsController(ISender sender) : ControllerBase
{
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetBatch(int id, CancellationToken ct) =>
        Ok(await sender.Send(new GetBatchByIdQuery(id), ct));

    [HttpGet("{id:int}/events")]
    public async Task<IActionResult> GetEvents(int id, CancellationToken ct) =>
        Ok((await sender.Send(new GetBatchByIdQuery(id), ct)).Events);

    [HttpPost("{id:int}/events")]
    public async Task<IActionResult> AppendEvent(int id, AppendSupplyChainEventRequest request, CancellationToken ct) =>
        Ok(await sender.Send(new AppendSupplyChainEventCommand(id, request.OrganizationId, request.PerformedByUserId,
            request.EventType, request.EventTime, request.Location, request.AdditionalData), ct));

    // Sự kiện append-only — không cho sửa/xoá (BUSINESS_FLOW.md §4, error-codes.md).
    [HttpPut("{id:int}/events"), HttpDelete("{id:int}/events")]
    public IActionResult RejectEventMutation(int id) =>
        StatusCode((int)HttpStatusCode.MethodNotAllowed,
            ApiResponse.Fail(HttpStatusCode.MethodNotAllowed, "Sự kiện đã ghi nhận không thể sửa hoặc xoá."));
}
