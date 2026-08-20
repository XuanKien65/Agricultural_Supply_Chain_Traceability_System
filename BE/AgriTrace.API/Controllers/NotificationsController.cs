using System.Security.Claims;
using AgriTrace.API.Models;
using AgriTrace.Application.Features.Notifications;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgriTrace.API.Controllers;

[ApiController]
[Authorize]
public sealed class NotificationsController(ISender sender) : ControllerBase
{
    /// <summary>
    /// GET /notifications - Lấy danh sách thông báo của người dùng hiện tại.
    /// </summary>
    [HttpGet("api/v1/notifications")]
    [HttpGet("api/notifications")]
    public async Task<IActionResult> GetNotifications(CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        var items = await sender.Send(new GetNotificationsQuery(userId), ct);
        return Ok(ApiResponse.Ok(new { items }));
    }

    /// <summary>
    /// GET /notifications/unread-count - Lấy số lượng thông báo chưa đọc.
    /// </summary>
    [HttpGet("api/v1/notifications/unread-count")]
    [HttpGet("api/notifications/unread-count")]
    public async Task<IActionResult> GetUnreadCount(CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        var result = await sender.Send(new GetUnreadCountQuery(userId), ct);
        return Ok(ApiResponse.Ok(result));
    }

    /// <summary>
    /// PATCH /notifications/{notificationId}/read - Đánh dấu một thông báo đã đọc.
    /// </summary>
    [HttpPatch("api/v1/notifications/{notificationId:int}/read")]
    [HttpPatch("api/notifications/{notificationId:int}/read")]
    public async Task<IActionResult> MarkRead(int notificationId, CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        await sender.Send(new MarkNotificationReadCommand(notificationId, userId), ct);
        return Ok(ApiResponse.Ok(null, "Đánh dấu đã đọc thành công"));
    }

    /// <summary>
    /// PATCH /notifications/read-all - Đánh dấu tất cả thông báo là đã đọc.
    /// </summary>
    [HttpPatch("api/v1/notifications/read-all")]
    [HttpPatch("api/notifications/read-all")]
    public async Task<IActionResult> MarkAllRead(CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        await sender.Send(new MarkAllNotificationsReadCommand(userId), ct);
        return Ok(ApiResponse.Ok(null, "Đánh dấu tất cả thông báo đã đọc thành công"));
    }

    private int GetCurrentUserId()
    {
        var userIdStr = User.FindFirstValue("userId")
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");

        return int.TryParse(userIdStr, out var id) ? id : 1;
    }
}
