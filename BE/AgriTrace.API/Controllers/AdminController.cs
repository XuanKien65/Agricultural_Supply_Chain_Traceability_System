using AgriTrace.API.Models;
using AgriTrace.Application.Features.Admin;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgriTrace.API.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "ADMIN,ORGADMIN")]
public sealed class AdminController(
    ISender sender)
    : ControllerBase
{
    // =========================
    // DASHBOARD
    // =========================

    [HttpGet("dashboard")]
    public async Task<IActionResult> Dashboard(
        CancellationToken ct)
    {
        var result =
            await sender.Send(
                new GetAdminDashboardQuery(),
                ct);

        return Ok(result);
    }


    // =========================
    // ROLES
    // =========================

    // Database hiện tại không có bảng Roles.
    // Role được lưu trực tiếp tại Users.Role.
    [HttpGet("roles")]
    public async Task<IActionResult> Roles(
        CancellationToken ct)
    {
        var result =
            await sender.Send(
                new GetAdminRolesQuery(),
                ct);

        return Ok(result);
    }


    // =========================
    // ORGANIZATIONS
    // =========================

    [HttpGet("organizations")]
    public async Task<IActionResult> Organizations(
        CancellationToken ct)
    {
        var result =
            await sender.Send(
                new GetAdminOrganizationsQuery(),
                ct);

        return Ok(result);
    }

    [HttpPost("organizations")]
    public async Task<IActionResult> CreateOrganization(
        AdminOrganizationRequest request,
        CancellationToken ct)
    {
        var result =
            await sender.Send(
                new CreateAdminOrganizationCommand(
                    request.Name,
                    request.Type,
                    request.Status),
                ct);

        return Created(
            $"/api/admin/organizations/{result.Id}",
            result);
    }

    [HttpPut("organizations/{id:int}")]
    public async Task<IActionResult> UpdateOrganization(
        int id,
        AdminOrganizationRequest request,
        CancellationToken ct)
    {
        var result =
            await sender.Send(
                new UpdateAdminOrganizationCommand(
                    id,
                    request.Name,
                    request.Type,
                    request.Status),
                ct);

        return Ok(result);
    }

    [HttpDelete("organizations/{id:int}")]
    public async Task<IActionResult> DeactivateOrganization(
        int id,
        CancellationToken ct)
    {
        await sender.Send(
            new DeactivateAdminOrganizationCommand(
                id),
            ct);

        return NoContent();
    }


    // =========================
    // USERS
    // =========================

    [HttpGet("users")]
    public async Task<IActionResult> Users(
        CancellationToken ct)
    {
        var result =
            await sender.Send(
                new GetAdminUsersQuery(),
                ct);

        return Ok(result);
    }

    [HttpPost("users")]
    public async Task<IActionResult> CreateUser(
        AdminUserRequest request,
        CancellationToken ct)
    {
        var passwordHash =
            HashPassword(
                request.Password);

        var result =
            await sender.Send(
                new CreateAdminUserCommand(
                    request.FullName,
                    request.Email,
                    passwordHash,
                    request.Role,
                    request.OrganizationId,
                    request.IsActive),
                ct);

        return Created(
            $"/api/admin/users/{result.Id}",
            result);
    }

    [HttpPut("users/{id:int}")]
    public async Task<IActionResult> UpdateUser(
        int id,
        AdminUserRequest request,
        CancellationToken ct)
    {
        var passwordHash =
            HashPassword(
                request.Password);

        var result =
            await sender.Send(
                new UpdateAdminUserCommand(
                    id,
                    request.FullName,
                    request.Email,
                    passwordHash,
                    request.Role,
                    request.OrganizationId,
                    request.IsActive),
                ct);

        return Ok(result);
    }

    [HttpDelete("users/{id:int}")]
    public async Task<IActionResult> DeactivateUser(
        int id,
        CancellationToken ct)
    {
        await sender.Send(
            new DeactivateAdminUserCommand(
                id),
            ct);

        return NoContent();
    }


    // =========================
    // PRODUCTS
    // =========================

    [HttpGet("products")]
    public async Task<IActionResult> Products(
        CancellationToken ct)
    {
        var result =
            await sender.Send(
                new GetAdminProductsQuery(),
                ct);

        return Ok(result);
    }

    [HttpPost("products")]
    public async Task<IActionResult> CreateProduct(
        AdminProductRequest request,
        CancellationToken ct)
    {
        var result =
            await sender.Send(
                new CreateAdminProductCommand(
                    request.Name,
                    request.Category,
                    request.Unit,
                    request.OrganizationId),
                ct);

        return Created(
            $"/api/admin/products/{result.Id}",
            result);
    }

    [HttpPut("products/{id:int}")]
    public async Task<IActionResult> UpdateProduct(
        int id,
        AdminProductRequest request,
        CancellationToken ct)
    {
        var result =
            await sender.Send(
                new UpdateAdminProductCommand(
                    id,
                    request.Name,
                    request.Category,
                    request.Unit,
                    request.OrganizationId),
                ct);

        return Ok(result);
    }

    [HttpDelete("products/{id:int}")]
    public async Task<IActionResult> DeleteProduct(
        int id,
        CancellationToken ct)
    {
        await sender.Send(
            new DeleteAdminProductCommand(
                id),
            ct);

        return NoContent();
    }


    // =========================
    // BATCHES
    // =========================

    [HttpGet("batches")]
    public async Task<IActionResult> Batches(
        CancellationToken ct)
    {
        var result =
            await sender.Send(
                new GetAdminBatchesQuery(),
                ct);

        return Ok(result);
    }

    [HttpPost("batches")]
    public async Task<IActionResult> CreateBatch(
        AdminBatchRequest request,
        CancellationToken ct)
    {
        var result =
            await sender.Send(
                new CreateAdminBatchCommand(
                    request.ProductId,
                    request.BatchCode,
                    request.Quantity,
                    request.CurrentOrganizationId,
                    request.ParentBatchId,
                    request.RootBatchId,
                    request.QrCode),
                ct);

        return Created(
            $"/api/admin/batches/{result.Id}",
            result);
    }

    [HttpPut("batches/{id:int}")]
    public async Task<IActionResult> UpdateBatch(
        int id,
        AdminBatchRequest request,
        CancellationToken ct)
    {
        var result =
            await sender.Send(
                new UpdateAdminBatchCommand(
                    id,
                    request.ProductId,
                    request.BatchCode,
                    request.Quantity,
                    request.CurrentOrganizationId,
                    request.ParentBatchId,
                    request.RootBatchId,
                    request.QrCode),
                ct);

        return Ok(result);
    }

    [HttpDelete("batches/{id:int}")]
    public async Task<IActionResult> DeleteBatch(
        int id,
        CancellationToken ct)
    {
        await sender.Send(
            new DeleteAdminBatchCommand(
                id),
            ct);

        return NoContent();
    }


    // =========================
    // EVENTS
    // =========================

    [HttpGet("events")]
    public async Task<IActionResult> Events(
        CancellationToken ct)
    {
        var result =
            await sender.Send(
                new GetAdminEventsQuery(),
                ct);

        return Ok(result);
    }

    // Event là append-only.
    // Không tạo PUT hoặc DELETE cho Event.
    [HttpPost("events")]
    public async Task<IActionResult> CreateEvent(
        AdminEventRequest request,
        CancellationToken ct)
    {
        var result =
            await sender.Send(
                new CreateAdminEventCommand(
                    request.BatchId,
                    request.EventType,
                    request.OrganizationId,
                    request.UserId,
                    request.EventData,
                    request.Location,
                    request.PreviousHash,
                    request.CurrentHash),
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
        CancellationToken ct)
    {
        var result =
            await sender.Send(
                new GetAdminInspectionsQuery(),
                ct);

        return Ok(result);
    }

    [HttpPost("inspections")]
    public async Task<IActionResult> CreateInspection(
        AdminInspectionRequest request,
        CancellationToken ct)
    {
        var result =
            await sender.Send(
                new CreateAdminInspectionCommand(
                    request.BatchId,
                    request.InspectorId,
                    request.Result,
                    request.Notes),
                ct);

        return Created(
            $"/api/admin/inspections/{result.Id}",
            result);
    }

    [HttpPut("inspections/{id:int}")]
    public async Task<IActionResult> UpdateInspection(
        int id,
        AdminInspectionRequest request,
        CancellationToken ct)
    {
        var result =
            await sender.Send(
                new UpdateAdminInspectionCommand(
                    id,
                    request.BatchId,
                    request.InspectorId,
                    request.Result,
                    request.Notes),
                ct);

        return Ok(result);
    }

    [HttpDelete("inspections/{id:int}")]
    public async Task<IActionResult> DeleteInspection(
        int id,
        CancellationToken ct)
    {
        await sender.Send(
            new DeleteAdminInspectionCommand(
                id),
            ct);

        return NoContent();
    }


    // =========================
    // CERTIFICATES
    // =========================

    [HttpGet("certificates")]
    public async Task<IActionResult> Certificates(
        CancellationToken ct)
    {
        var result =
            await sender.Send(
                new GetAdminCertificatesQuery(),
                ct);

        return Ok(result);
    }

    [HttpPost("certificates")]
    public async Task<IActionResult> CreateCertificate(
        AdminCertificateRequest request,
        CancellationToken ct)
    {
        var result =
            await sender.Send(
                new CreateAdminCertificateCommand(
                    request.BatchId,
                    request.InspectionId,
                    request.CertificateType,
                    request.FileUrl),
                ct);

        return Created(
            $"/api/admin/certificates/{result.Id}",
            result);
    }

    [HttpPut("certificates/{id:int}")]
    public async Task<IActionResult> UpdateCertificate(
        int id,
        AdminCertificateRequest request,
        CancellationToken ct)
    {
        var result =
            await sender.Send(
                new UpdateAdminCertificateCommand(
                    id,
                    request.BatchId,
                    request.InspectionId,
                    request.CertificateType,
                    request.FileUrl),
                ct);

        return Ok(result);
    }

    [HttpDelete("certificates/{id:int}")]
    public async Task<IActionResult> DeleteCertificate(
        int id,
        CancellationToken ct)
    {
        await sender.Send(
            new DeleteAdminCertificateCommand(
                id),
            ct);

        return NoContent();
    }


    // =========================
    // RECALLS
    // =========================

    [HttpGet("recalls")]
    public async Task<IActionResult> Recalls(
        CancellationToken ct)
    {
        var result =
            await sender.Send(
                new GetAdminRecallsQuery(),
                ct);

        return Ok(result);
    }

    [HttpPost("recalls")]
    public async Task<IActionResult> CreateRecall(
        AdminRecallRequest request,
        CancellationToken ct)
    {
        var result =
            await sender.Send(
                new CreateAdminRecallCommand(
                    request.BatchId,
                    request.Reason,
                    request.Severity,
                    request.CreatedBy),
                ct);

        return Created(
            $"/api/admin/recalls/{result.Id}",
            result);
    }

    [HttpPut("recalls/{id:int}")]
    public async Task<IActionResult> UpdateRecall(
        int id,
        AdminRecallRequest request,
        CancellationToken ct)
    {
        var result =
            await sender.Send(
                new UpdateAdminRecallCommand(
                    id,
                    request.BatchId,
                    request.Reason,
                    request.Severity,
                    request.CreatedBy),
                ct);

        return Ok(result);
    }

    [HttpDelete("recalls/{id:int}")]
    public async Task<IActionResult> DeleteRecall(
        int id,
        CancellationToken ct)
    {
        await sender.Send(
            new DeleteAdminRecallCommand(
                id),
            ct);

        return NoContent();
    }


    // =========================
    // PASSWORD
    // =========================

    private static string? HashPassword(
        string? password)
    {
        if (
            string.IsNullOrWhiteSpace(
                password))
        {
            return null;
        }

        return BCrypt.Net.BCrypt.HashPassword(
            password,
            workFactor: 11);
    }
}