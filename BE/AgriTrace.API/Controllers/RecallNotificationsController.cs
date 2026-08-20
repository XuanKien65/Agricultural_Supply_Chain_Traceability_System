using AgriTrace.Application.Features.Recalls.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgriTrace.API.Controllers;

/// <summary>
/// Quản lý thông báo thu hồi sản phẩm (Recall Notifications).
/// Các Organization xem và xác nhận thông báo thu hồi liên quan.
/// </summary>
[ApiController]
[Route("api/recall-notifications")]
[Authorize]
public sealed class RecallNotificationsController(ISender sender) : ControllerBase
{
    /// <summary>
    /// Lấy danh sách thông báo thu hồi cho một Organization.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetNotifications([FromQuery] int organizationId, CancellationToken ct) =>
        Ok(await sender.Send(new GetRecallNotificationsForOrgQuery(organizationId), ct));

    /// <summary>
    /// Xem chi tiết một cảnh báo thu hồi kèm danh sách thông báo lan truyền.
    /// </summary>
    [HttpGet("recall/{recallId:int}")]
    public async Task<IActionResult> GetRecallDetail(int recallId, CancellationToken ct) =>
        Ok(await sender.Send(new GetRecallDetailQuery(recallId), ct));

    /// <summary>
    /// Xác nhận đã nhận và xử lý thông báo thu hồi.
    /// </summary>
    [HttpPut("{id:int}/acknowledge")]
    public async Task<IActionResult> Acknowledge(int id, [FromBody] AcknowledgeRequest? request, CancellationToken ct)
    {
        await sender.Send(new AcknowledgeRecallNotificationCommand(id, request?.ProcessingNotes), ct);
        return Ok(new { message = "Đã xác nhận thông báo thu hồi." });
    }
}

public class AcknowledgeRequest
{
    public string? ProcessingNotes { get; init; }
}
