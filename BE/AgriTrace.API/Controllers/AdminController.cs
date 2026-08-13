using AgriTrace.API.Models;
using AgriTrace.Application.Features.Admin;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace AgriTrace.API.Controllers;

[ApiController]
[Route("api/admin")]
public sealed class AdminController(
    ISender sender)
    : ControllerBase
{
    private static readonly PasswordHasher<object>
        PasswordHasher = new();

    private static readonly object
        PasswordSubject = new();


    // =========================
    // DASHBOARD + ROLES
    // =========================

    [HttpGet("dashboard")]
    public async Task<IActionResult> Dashboard(
        CancellationToken ct) =>
        Ok(
            await sender.Send(
                new GetAdminDashboardQuery(),
                ct));

    // Database.md không có bảng Roles.
    // Role lấy trực tiếp từ Users.Role.
    [HttpGet("roles")]
    public async Task<IActionResult> Roles(
        CancellationToken ct) =>
        Ok(
            await sender.Send(
                new GetAdminRolesQuery(),
                ct));


    // =========================
    // ORGANIZATIONS
    // =========================

    [HttpGet("organizations")]
    public async Task<IActionResult> Organizations(
        CancellationToken ct) =>
        Ok(
            await sender.Send(
                new GetAdminOrganizationsQuery(),
                ct));

    [HttpPost("organizations")]
    public async Task<IActionResult> CreateOrganization(
        AdminOrganizationRequest r,
        CancellationToken ct)
    {
        var result =
            await sender.Send(
                new CreateAdminOrganizationCommand(
                    r.Name,
                    r.Type,
                    r.Status),
                ct);

        return Created(
            $"/api/admin/organizations/{result.Id}",
            result);
    }

    [HttpPut("organizations/{id:int}")]
    public async Task<IActionResult> UpdateOrganization(
        int id,
        AdminOrganizationRequest r,
        CancellationToken ct) =>
        Ok(
            await sender.Send(
                new UpdateAdminOrganizationCommand(
                    id,
                    r.Name,
                    r.Type,
                    r.Status),
                ct));

    [HttpDelete("organizations/{id:int}")]
    public async Task<IActionResult> DeactivateOrganization(
        int id,
        CancellationToken ct)
    {
        await sender.Send(
            new DeactivateAdminOrganizationCommand(id),
            ct);

        return NoContent();
    }


    // =========================
    // USERS
    // =========================

    [HttpGet("users")]
    public async Task<IActionResult> Users(
        CancellationToken ct) =>
        Ok(
            await sender.Send(
                new GetAdminUsersQuery(),
                ct));

    [HttpPost("users")]
    public async Task<IActionResult> CreateUser(
        AdminUserRequest r,
        CancellationToken ct)
    {
        var result =
            await sender.Send(
                new CreateAdminUserCommand(
                    r.FullName,
                    r.Email,
                    HashPassword(r.Password),
                    r.Role,
                    r.OrganizationId,
                    r.IsActive),
                ct);

        return Created(
            $"/api/admin/users/{result.Id}",
            result);
    }

    [HttpPut("users/{id:int}")]
    public async Task<IActionResult> UpdateUser(
        int id,
        AdminUserRequest r,
        CancellationToken ct) =>
        Ok(
            await sender.Send(
                new UpdateAdminUserCommand(
                    id,
                    r.FullName,
                    r.Email,
                    HashPassword(r.Password),
                    r.Role,
                    r.OrganizationId,
                    r.IsActive),
                ct));

    [HttpDelete("users/{id:int}")]
    public async Task<IActionResult> DeactivateUser(
        int id,
        CancellationToken ct)
    {
        await sender.Send(
            new DeactivateAdminUserCommand(id),
            ct);

        return NoContent();
    }


    // =========================
    // PRODUCTS
    // =========================

    [HttpGet("products")]
    public async Task<IActionResult> Products(
        CancellationToken ct) =>
        Ok(
            await sender.Send(
                new GetAdminProductsQuery(),
                ct));

    [HttpPost("products")]
    public async Task<IActionResult> CreateProduct(
        AdminProductRequest r,
        CancellationToken ct)
    {
        var result =
            await sender.Send(
                new CreateAdminProductCommand(
                    r.Name,
                    r.Category,
                    r.Unit,
                    r.OrganizationId),
                ct);

        return Created(
            $"/api/admin/products/{result.Id}",
            result);
    }

    [HttpPut("products/{id:int}")]
    public async Task<IActionResult> UpdateProduct(
        int id,
        AdminProductRequest r,
        CancellationToken ct) =>
        Ok(
            await sender.Send(
                new UpdateAdminProductCommand(
                    id,
                    r.Name,
                    r.Category,
                    r.Unit,
                    r.OrganizationId),
                ct));

    [HttpDelete("products/{id:int}")]
    public async Task<IActionResult> DeleteProduct(
        int id,
        CancellationToken ct)
    {
        await sender.Send(
            new DeleteAdminProductCommand(id),
            ct);

        return NoContent();
    }


    // =========================
    // BATCHES
    // =========================

    [HttpGet("batches")]
    public async Task<IActionResult> Batches(
        CancellationToken ct) =>
        Ok(
            await sender.Send(
                new GetAdminBatchesQuery(),
                ct));

    [HttpPost("batches")]
    public async Task<IActionResult> CreateBatch(
        AdminBatchRequest r,
        CancellationToken ct)
    {
        var result =
            await sender.Send(
                new CreateAdminBatchCommand(
                    r.ProductId,
                    r.BatchCode,
                    r.Quantity,
                    r.CurrentOrganizationId,
                    r.ParentBatchId,
                    r.RootBatchId,
                    r.QrCode),
                ct);

        return Created(
            $"/api/admin/batches/{result.Id}",
            result);
    }

    [HttpPut("batches/{id:int}")]
    public async Task<IActionResult> UpdateBatch(
        int id,
        AdminBatchRequest r,
        CancellationToken ct) =>
        Ok(
            await sender.Send(
                new UpdateAdminBatchCommand(
                    id,
                    r.ProductId,
                    r.BatchCode,
                    r.Quantity,
                    r.CurrentOrganizationId,
                    r.ParentBatchId,
                    r.RootBatchId,
                    r.QrCode),
                ct));

    [HttpDelete("batches/{id:int}")]
    public async Task<IActionResult> DeleteBatch(
        int id,
        CancellationToken ct)
    {
        await sender.Send(
            new DeleteAdminBatchCommand(id),
            ct);

        return NoContent();
    }


    // =========================
    // EVENTS
    // =========================

    [HttpGet("events")]
    public async Task<IActionResult> Events(
        CancellationToken ct) =>
        Ok(
            await sender.Send(
                new GetAdminEventsQuery(),
                ct));

    // Không có PUT/DELETE event.
    // Database.md quy định đây là lịch sử immutable.
    [HttpPost("events")]
    public async Task<IActionResult> CreateEvent(
        AdminEventRequest r,
        CancellationToken ct)
    {
        var result =
            await sender.Send(
                new CreateAdminEventCommand(
                    r.BatchId,
                    r.EventType,
                    r.OrganizationId,
                    r.UserId,
                    r.EventData,
                    r.Location,
                    r.PreviousHash,
                    r.CurrentHash),
                ct);

        return Created(
            $"/api/admin/events/{result.Id}",
            result);
    }


    // =========================
    // INSPECTIONS
    // =========================

    [HttpGet("inspections")]
    public async Task<IActionResult> Inspections(
        CancellationToken ct) =>
        Ok(
            await sender.Send(
                new GetAdminInspectionsQuery(),
                ct));

    [HttpPost("inspections")]
    public async Task<IActionResult> CreateInspection(
        AdminInspectionRequest r,
        CancellationToken ct)
    {
        var result =
            await sender.Send(
                new CreateAdminInspectionCommand(
                    r.BatchId,
                    r.InspectorId,
                    r.Result,
                    r.Notes),
                ct);

        return Created(
            $"/api/admin/inspections/{result.Id}",
            result);
    }

    [HttpPut("inspections/{id:int}")]
    public async Task<IActionResult> UpdateInspection(
        int id,
        AdminInspectionRequest r,
        CancellationToken ct) =>
        Ok(
            await sender.Send(
                new UpdateAdminInspectionCommand(
                    id,
                    r.BatchId,
                    r.InspectorId,
                    r.Result,
                    r.Notes),
                ct));

    [HttpDelete("inspections/{id:int}")]
    public async Task<IActionResult> DeleteInspection(
        int id,
        CancellationToken ct)
    {
        await sender.Send(
            new DeleteAdminInspectionCommand(id),
            ct);

        return NoContent();
    }


    // =========================
    // CERTIFICATES
    // =========================

    [HttpGet("certificates")]
    public async Task<IActionResult> Certificates(
        CancellationToken ct) =>
        Ok(
            await sender.Send(
                new GetAdminCertificatesQuery(),
                ct));

    [HttpPost("certificates")]
    public async Task<IActionResult> CreateCertificate(
        AdminCertificateRequest r,
        CancellationToken ct)
    {
        var result =
            await sender.Send(
                new CreateAdminCertificateCommand(
                    r.BatchId,
                    r.InspectionId,
                    r.CertificateType,
                    r.FileUrl),
                ct);

        return Created(
            $"/api/admin/certificates/{result.Id}",
            result);
    }

    [HttpPut("certificates/{id:int}")]
    public async Task<IActionResult> UpdateCertificate(
        int id,
        AdminCertificateRequest r,
        CancellationToken ct) =>
        Ok(
            await sender.Send(
                new UpdateAdminCertificateCommand(
                    id,
                    r.BatchId,
                    r.InspectionId,
                    r.CertificateType,
                    r.FileUrl),
                ct));

    [HttpDelete("certificates/{id:int}")]
    public async Task<IActionResult> DeleteCertificate(
        int id,
        CancellationToken ct)
    {
        await sender.Send(
            new DeleteAdminCertificateCommand(id),
            ct);

        return NoContent();
    }


    // =========================
    // RECALLS
    // =========================

    [HttpGet("recalls")]
    public async Task<IActionResult> Recalls(
        CancellationToken ct) =>
        Ok(
            await sender.Send(
                new GetAdminRecallsQuery(),
                ct));

    [HttpPost("recalls")]
    public async Task<IActionResult> CreateRecall(
        AdminRecallRequest r,
        CancellationToken ct)
    {
        var result =
            await sender.Send(
                new CreateAdminRecallCommand(
                    r.BatchId,
                    r.Reason,
                    r.Severity,
                    r.CreatedBy),
                ct);

        return Created(
            $"/api/admin/recalls/{result.Id}",
            result);
    }

    [HttpPut("recalls/{id:int}")]
    public async Task<IActionResult> UpdateRecall(
        int id,
        AdminRecallRequest r,
        CancellationToken ct) =>
        Ok(
            await sender.Send(
                new UpdateAdminRecallCommand(
                    id,
                    r.BatchId,
                    r.Reason,
                    r.Severity,
                    r.CreatedBy),
                ct));

    [HttpDelete("recalls/{id:int}")]
    public async Task<IActionResult> DeleteRecall(
        int id,
        CancellationToken ct)
    {
        await sender.Send(
            new DeleteAdminRecallCommand(id),
            ct);

        return NoContent();
    }


    private static string? HashPassword(
        string? password) =>
        string.IsNullOrWhiteSpace(password)
            ? null
            : PasswordHasher.HashPassword(
                PasswordSubject,
                password);
}