using System.Net;
using AgriTrace.API.Models;
using AgriTrace.Application.Features.Batches.Queries;
using AgriTrace.Application.Features.Events.Commands;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgriTrace.API.Controllers;
[ApiController, Route("api/batches"), Authorize]
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
            ApiResponse.Fail("Sự kiện đã ghi nhận không thể sửa hoặc xoá."));

    /// <summary>
    /// Kiểm tra tính toàn vẹn hash chain của lô hàng.
    /// Xác minh mỗi sự kiện có Hash đúng và PreviousHash khớp sự kiện trước.
    /// </summary>
    [HttpGet("{id:int}/verify")]
    public async Task<IActionResult> VerifyHashChain(int id, CancellationToken ct) =>
        Ok(await sender.Send(new VerifyHashChainQuery(id), ct));

    // Spec-compliant endpoint: GET /api/batches/{id}/events/verify-integrity
    [HttpGet("{id:int}/events/verify-integrity")]
    public async Task<IActionResult> VerifyHashChainIntegrity(int id, CancellationToken ct) =>
        Ok(await sender.Send(new VerifyHashChainQuery(id), ct));

    [HttpPost("{id:int}/split")]
    public async Task<IActionResult> SplitBatch(int id, SplitBatchRequest request, CancellationToken ct) =>
        Ok(await sender.Send(new AgriTrace.Application.Features.Batches.Commands.SplitBatchCommand(id, request.OrganizationId, request.PerformedByUserId,
            request.ChildBatches.Select(x => new AgriTrace.Application.Features.Batches.Commands.SplitChildRequest(x.Quantity)).ToList(), request.Location, request.EventTime), ct));

    [HttpPost("merge")]
    public async Task<IActionResult> MergeBatches(MergeBatchesRequest request, CancellationToken ct) =>
        Ok(await sender.Send(new AgriTrace.Application.Features.Batches.Commands.MergeBatchesCommand(request.Sources.Select(s => new AgriTrace.Application.Features.Batches.Commands.MergeSourceRequest(s.BatchId, s.Quantity)).ToList(),
            request.OrganizationId, request.PerformedByUserId, request.Location, request.Description, request.EventTime), ct));

    [HttpGet("{id:int}/qr-code")]
    public async Task<IActionResult> GetQrCode(int id, CancellationToken ct)
    {
        var batch = await sender.Send(new AgriTrace.Application.Features.Batches.Queries.GetBatchByIdQuery(id), ct);
        if (batch is null) return NotFound(ApiResponse.Fail("Batch not found"));
        // Redirect to stored QR code URL (front-end/public URL).
        return Redirect(batch.QrCode);
    }

    [HttpPost("{id:int}/images")]
    [RequestSizeLimit(10_485_760)] // ~10 MB
    public async Task<IActionResult> UploadBatchImage(int id)
    {
        var req = HttpContext.Request;
        if (!req.HasFormContentType) return BadRequest(ApiResponse.Fail("Invalid content type"));
        var form = await req.ReadFormAsync();
        var file = form.Files.GetFile("file");
        if (file == null) return BadRequest(ApiResponse.Fail("No file provided"));
        // Limit file size server-side
        const long maxBytes = 10_485_760; // 10 MB
        if (file.Length <= 0 || file.Length > maxBytes) return BadRequest(ApiResponse.Fail("File size is invalid or exceeds limit"));

        // Validate content type and magic bytes for common images
        var allowedContentTypes = new[] { "image/png", "image/jpeg", "image/webp" };
        if (!allowedContentTypes.Contains(file.ContentType)) return BadRequest(ApiResponse.Fail("Unsupported file type"));

        static async Task<bool> HasValidImageSignatureAsync(Stream s, string contentType)
        {
            s.Seek(0, SeekOrigin.Begin);
            Span<byte> header = stackalloc byte[12];
            var read = await s.ReadAsync(header);
            s.Seek(0, SeekOrigin.Begin);

            if (contentType == "image/png")
            {
                return header.Length >= 8 && header[0] == 0x89 && header[1] == 0x50 && header[2] == 0x4E && header[3] == 0x47 && header[4] == 0x0D && header[5] == 0x0A && header[6] == 0x1A && header[7] == 0x0A;
            }
            if (contentType == "image/jpeg")
            {
                return header.Length >= 3 && header[0] == 0xFF && header[1] == 0xD8 && header[2] == 0xFF;
            }
            if (contentType == "image/webp")
            {
                // 'RIFF'....'WEBP'
                return header.Length >= 12 && header[0] == (byte)'R' && header[1] == (byte)'I' && header[2] == (byte)'F' && header[3] == (byte)'F' && header[8] == (byte)'W' && header[9] == (byte)'E' && header[10] == (byte)'B' && header[11] == (byte)'P';
            }
            return false;
        }

        await using var fileStream = file.OpenReadStream();
        if (!await HasValidImageSignatureAsync(fileStream, file.ContentType)) return BadRequest(ApiResponse.Fail("File signature does not match content type"));

        var uploadsRoot = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "batches", id.ToString());
        Directory.CreateDirectory(uploadsRoot);

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(ext))
        {
            // Map common content types to extensions
            ext = file.ContentType switch
            {
                "image/png" => ".png",
                "image/jpeg" => ".jpg",
                "image/webp" => ".webp",
                _ => ".bin"
            };
        }

        var fileName = $"{Guid.NewGuid()}{ext}";
        var savePath = Path.Combine(uploadsRoot, fileName);
        // Ensure we do not overwrite existing files
        while (System.IO.File.Exists(savePath))
        {
            fileName = $"{Guid.NewGuid()}{ext}";
            savePath = Path.Combine(uploadsRoot, fileName);
        }

        await using (var fs = new FileStream(savePath, FileMode.CreateNew)) { await file.CopyToAsync(fs); }

        var publicUrl = $"/uploads/batches/{id}/{fileName}";
        var caption = form["caption"].FirstOrDefault();
        var displayOrder = int.TryParse(form["displayOrder"].FirstOrDefault(), out var v) ? v : 0;
        var eventId = int.TryParse(form["eventId"].FirstOrDefault(), out var ev) ? ev : (int?)null;

        await sender.Send(new AgriTrace.Application.Features.Images.Commands.UploadBatchImageCommand(id, publicUrl, caption, displayOrder, eventId), CancellationToken.None);

        return Created(string.Empty, ApiResponse.Ok(new { imageUrl = publicUrl }));
    }
}
