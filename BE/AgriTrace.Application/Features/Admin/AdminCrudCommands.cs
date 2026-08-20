using AgriTrace.Application.Common.Exceptions;
using AgriTrace.Application.Contracts;
using AgriTrace.Domain.Interfaces;
using MediatR;

namespace AgriTrace.Application.Features.Admin;

public sealed record CreateAdminOrganizationCommand(
    string Name,
    string Type,
    string Status)
    : IRequest<AdminOrganizationDto>;

public sealed record UpdateAdminOrganizationCommand(
    int Id,
    string Name,
    string Type,
    string Status)
    : IRequest<AdminOrganizationDto>;

public sealed record DeactivateAdminOrganizationCommand(
    int Id)
    : IRequest;


public sealed record CreateAdminProductCommand(
    string? Name,
    string? Category,
    string? Unit,
    int OrganizationId)
    : IRequest<AdminProductDto>;

public sealed record UpdateAdminProductCommand(
    int Id,
    string? Name,
    string? Category,
    string? Unit,
    int OrganizationId)
    : IRequest<AdminProductDto>;

public sealed record DeleteAdminProductCommand(
    int Id)
    : IRequest;


public sealed record CreateAdminBatchCommand(
    int ProductId,
    string BatchCode,
    decimal Quantity,
    int? CurrentOrganizationId,
    int? ParentBatchId,
    int? RootBatchId,
    string? QrCode)
    : IRequest<AdminBatchDto>;

public sealed record UpdateAdminBatchCommand(
    int Id,
    int ProductId,
    string BatchCode,
    decimal Quantity,
    int? CurrentOrganizationId,
    int? ParentBatchId,
    int? RootBatchId,
    string? QrCode)
    : IRequest<AdminBatchDto>;

public sealed record DeleteAdminBatchCommand(
    int Id)
    : IRequest;


public sealed record CreateAdminEventCommand(
    int BatchId,
    string EventType,
    int OrganizationId,
    int UserId,
    string? EventData,
    string? Location,
    string? PreviousHash,
    string? CurrentHash)
    : IRequest<AdminSupplyChainEventDto>;


public sealed record CreateAdminInspectionCommand(
    int BatchId,
    int InspectorId,
    string? Result,
    string? Notes)
    : IRequest<AdminInspectionDto>;

public sealed record UpdateAdminInspectionCommand(
    int Id,
    int BatchId,
    int InspectorId,
    string? Result,
    string? Notes)
    : IRequest<AdminInspectionDto>;

public sealed record DeleteAdminInspectionCommand(
    int Id)
    : IRequest;


public sealed record CreateAdminCertificateCommand(
    int BatchId,
    int? InspectionId,
    string? CertificateType,
    string? FileUrl)
    : IRequest<AdminCertificateDto>;

public sealed record UpdateAdminCertificateCommand(
    int Id,
    int BatchId,
    int? InspectionId,
    string? CertificateType,
    string? FileUrl)
    : IRequest<AdminCertificateDto>;

public sealed record DeleteAdminCertificateCommand(
    int Id)
    : IRequest;


public sealed record CreateAdminRecallCommand(
    int BatchId,
    string? Reason,
    string? Severity,
    int CreatedBy)
    : IRequest<AdminRecallDto>;

public sealed record UpdateAdminRecallCommand(
    int Id,
    int BatchId,
    string? Reason,
    string? Severity,
    int CreatedBy)
    : IRequest<AdminRecallDto>;

public sealed record DeleteAdminRecallCommand(
    int Id)
    : IRequest;


public sealed class AdminCrudCommandHandler(
    IAdminCrudRepository repository,
    IRecallNotificationRepository recallNotifications)
    :
        IRequestHandler<
            CreateAdminOrganizationCommand,
            AdminOrganizationDto>,
        IRequestHandler<
            UpdateAdminOrganizationCommand,
            AdminOrganizationDto>,
        IRequestHandler<
            DeactivateAdminOrganizationCommand>,
        IRequestHandler<
            CreateAdminProductCommand,
            AdminProductDto>,
        IRequestHandler<
            UpdateAdminProductCommand,
            AdminProductDto>,
        IRequestHandler<
            DeleteAdminProductCommand>,
        IRequestHandler<
            CreateAdminBatchCommand,
            AdminBatchDto>,
        IRequestHandler<
            UpdateAdminBatchCommand,
            AdminBatchDto>,
        IRequestHandler<
            DeleteAdminBatchCommand>,
        IRequestHandler<
            CreateAdminEventCommand,
            AdminSupplyChainEventDto>,
        IRequestHandler<
            CreateAdminInspectionCommand,
            AdminInspectionDto>,
        IRequestHandler<
            UpdateAdminInspectionCommand,
            AdminInspectionDto>,
        IRequestHandler<
            DeleteAdminInspectionCommand>,
        IRequestHandler<
            CreateAdminCertificateCommand,
            AdminCertificateDto>,
        IRequestHandler<
            UpdateAdminCertificateCommand,
            AdminCertificateDto>,
        IRequestHandler<
            DeleteAdminCertificateCommand>,
        IRequestHandler<
            CreateAdminRecallCommand,
            AdminRecallDto>,
        IRequestHandler<
            UpdateAdminRecallCommand,
            AdminRecallDto>,
        IRequestHandler<
            DeleteAdminRecallCommand>
{
    public async Task<AdminOrganizationDto> Handle(
        CreateAdminOrganizationCommand r,
        CancellationToken ct) =>
        (
            await repository.CreateOrganizationAsync(
                r.Name,
                r.Type,
                r.Status,
                ct)
        ).ToDto();

    public async Task<AdminOrganizationDto> Handle(
        UpdateAdminOrganizationCommand r,
        CancellationToken ct) =>
        (
            await repository.UpdateOrganizationAsync(
                r.Id,
                r.Name,
                r.Type,
                r.Status,
                ct)
        )?.ToDto()
        ?? throw new NotFoundException(
            $"Organization '{r.Id}' not found.");

    public async Task Handle(
        DeactivateAdminOrganizationCommand r,
        CancellationToken ct)
    {
        if (
            !await repository.DeactivateOrganizationAsync(
                r.Id,
                ct))
        {
            throw new NotFoundException(
                $"Organization '{r.Id}' not found.");
        }
    }


    public async Task<AdminProductDto> Handle(
        CreateAdminProductCommand r,
        CancellationToken ct) =>
        (
            await repository.CreateProductAsync(
                r.Name,
                r.Category,
                r.Unit,
                r.OrganizationId,
                ct)
        ).ToDto();

    public async Task<AdminProductDto> Handle(
        UpdateAdminProductCommand r,
        CancellationToken ct) =>
        (
            await repository.UpdateProductAsync(
                r.Id,
                r.Name,
                r.Category,
                r.Unit,
                r.OrganizationId,
                ct)
        )?.ToDto()
        ?? throw new NotFoundException(
            $"Product '{r.Id}' not found.");

    public async Task Handle(
        DeleteAdminProductCommand r,
        CancellationToken ct)
    {
        if (
            !await repository.DeleteProductAsync(
                r.Id,
                ct))
        {
            throw new NotFoundException(
                $"Product '{r.Id}' not found.");
        }
    }


    public async Task<AdminBatchDto> Handle(
        CreateAdminBatchCommand r,
        CancellationToken ct) =>
        (
            await repository.CreateBatchAsync(
                r.ProductId,
                r.BatchCode,
                r.Quantity,
                r.CurrentOrganizationId,
                r.ParentBatchId,
                r.RootBatchId,
                r.QrCode,
                ct)
        ).ToDto();

    public async Task<AdminBatchDto> Handle(
        UpdateAdminBatchCommand r,
        CancellationToken ct) =>
        (
            await repository.UpdateBatchAsync(
                r.Id,
                r.ProductId,
                r.BatchCode,
                r.Quantity,
                r.CurrentOrganizationId,
                r.ParentBatchId,
                r.RootBatchId,
                r.QrCode,
                ct)
        )?.ToDto()
        ?? throw new NotFoundException(
            $"Batch '{r.Id}' not found.");

    public async Task Handle(
        DeleteAdminBatchCommand r,
        CancellationToken ct)
    {
        if (
            !await repository.DeleteBatchAsync(
                r.Id,
                ct))
        {
            throw new NotFoundException(
                $"Batch '{r.Id}' not found.");
        }
    }


    public async Task<AdminSupplyChainEventDto> Handle(
        CreateAdminEventCommand r,
        CancellationToken ct) =>
        (
            await repository.CreateEventAsync(
                r.BatchId,
                r.EventType,
                r.OrganizationId,
                r.UserId,
                r.EventData,
                r.Location,
                r.PreviousHash,
                r.CurrentHash,
                ct)
        ).ToDto();


    public async Task<AdminInspectionDto> Handle(
        CreateAdminInspectionCommand r,
        CancellationToken ct) =>
        (
            await repository.CreateInspectionAsync(
                r.BatchId,
                r.InspectorId,
                r.Result,
                r.Notes,
                ct)
        ).ToDto();

    public async Task<AdminInspectionDto> Handle(
        UpdateAdminInspectionCommand r,
        CancellationToken ct) =>
        (
            await repository.UpdateInspectionAsync(
                r.Id,
                r.BatchId,
                r.InspectorId,
                r.Result,
                r.Notes,
                ct)
        )?.ToDto()
        ?? throw new NotFoundException(
            $"Inspection '{r.Id}' not found.");

    public async Task Handle(
        DeleteAdminInspectionCommand r,
        CancellationToken ct)
    {
        if (
            !await repository.DeleteInspectionAsync(
                r.Id,
                ct))
        {
            throw new NotFoundException(
                $"Inspection '{r.Id}' not found.");
        }
    }


    public async Task<AdminCertificateDto> Handle(
        CreateAdminCertificateCommand r,
        CancellationToken ct) =>
        (
            await repository.CreateCertificateAsync(
                r.BatchId,
                r.InspectionId,
                r.CertificateType,
                r.FileUrl,
                ct)
        ).ToDto();

    public async Task<AdminCertificateDto> Handle(
        UpdateAdminCertificateCommand r,
        CancellationToken ct) =>
        (
            await repository.UpdateCertificateAsync(
                r.Id,
                r.BatchId,
                r.InspectionId,
                r.CertificateType,
                r.FileUrl,
                ct)
        )?.ToDto()
        ?? throw new NotFoundException(
            $"Certificate '{r.Id}' not found.");

    public async Task Handle(
        DeleteAdminCertificateCommand r,
        CancellationToken ct)
    {
        if (
            !await repository.DeleteCertificateAsync(
                r.Id,
                ct))
        {
            throw new NotFoundException(
                $"Certificate '{r.Id}' not found.");
        }
    }


    public async Task<AdminRecallDto> Handle(
        CreateAdminRecallCommand r,
        CancellationToken ct)
    {
        var recall = await repository.CreateRecallAsync(
            r.BatchId,
            r.Reason,
            r.Severity,
            r.CreatedBy,
            ct);

        // Tự động lan truyền thông báo thu hồi tới các Organization đã tham gia chuỗi
        await recallNotifications.PropagateRecallNotificationsAsync(
            recall.Id,
            recall.BatchId,
            ct);

        return recall.ToDto();
    }

    public async Task<AdminRecallDto> Handle(
        UpdateAdminRecallCommand r,
        CancellationToken ct) =>
        (
            await repository.UpdateRecallAsync(
                r.Id,
                r.BatchId,
                r.Reason,
                r.Severity,
                r.CreatedBy,
                ct)
        )?.ToDto()
        ?? throw new NotFoundException(
            $"Recall '{r.Id}' not found.");

    public async Task Handle(
        DeleteAdminRecallCommand r,
        CancellationToken ct)
    {
        if (
            !await repository.DeleteRecallAsync(
                r.Id,
                ct))
        {
            throw new NotFoundException(
                $"Recall '{r.Id}' not found.");
        }
    }
}