using AgriTrace.Application.Common.Exceptions;
using AgriTrace.Domain.Common;
using AgriTrace.Domain.Entities;
using AgriTrace.Domain.Interfaces;
using MediatR;

namespace AgriTrace.Application.Features.Organizations;

public record OrganizationDto(
    int OrganizationId,
    string Name,
    string Type,
    string Status,
    DateTime CreatedAt);

public record GetOrganizationsQuery(
    string? Type, string? Status, string? Search, int Page = 1, int PageSize = 20) : IRequest<PagedResult<OrganizationDto>>;

public record GetOrganizationByIdQuery(int OrganizationId) : IRequest<OrganizationDto>;
public record CreateOrganizationCommand(string Name, string Type) : IRequest<OrganizationDto>;
public record UpdateOrganizationCommand(int OrganizationId, string Name, string Type) : IRequest<OrganizationDto>;
public record UpdateOrganizationStatusCommand(int OrganizationId, string Status) : IRequest;

public sealed class OrganizationQueryCommandHandler(IOrganizationRepository repo)
    : IRequestHandler<GetOrganizationsQuery, PagedResult<OrganizationDto>>,
      IRequestHandler<GetOrganizationByIdQuery, OrganizationDto>,
      IRequestHandler<CreateOrganizationCommand, OrganizationDto>,
      IRequestHandler<UpdateOrganizationCommand, OrganizationDto>,
      IRequestHandler<UpdateOrganizationStatusCommand>
{
    public async Task<PagedResult<OrganizationDto>> Handle(GetOrganizationsQuery request, CancellationToken ct)
    {
        var result = await repo.GetAllPagedAsync(request.Type, request.Status, request.Search, request.Page, request.PageSize, ct);
        var dtos = result.Items.Select(ToDto).ToList();
        return new PagedResult<OrganizationDto>(dtos, result.TotalCount);
    }

    public async Task<OrganizationDto> Handle(GetOrganizationByIdQuery request, CancellationToken ct)
    {
        var org = await repo.GetByIdAsync(request.OrganizationId, ct)
            ?? throw new NotFoundException($"Không tìm thấy tổ chức #{request.OrganizationId}.");
        return ToDto(org);
    }

    public async Task<OrganizationDto> Handle(CreateOrganizationCommand request, CancellationToken ct)
    {
        var org = new Organization(0, request.Name, request.Type);
        var created = await repo.AddAsync(org, ct);
        return ToDto(created);
    }

    public async Task<OrganizationDto> Handle(UpdateOrganizationCommand request, CancellationToken ct)
    {
        var org = await repo.GetByIdAsync(request.OrganizationId, ct)
            ?? throw new NotFoundException($"Không tìm thấy tổ chức #{request.OrganizationId}.");

        org.Update(request.Name, request.Type);
        var updated = await repo.UpdateAsync(org, ct);
        return ToDto(updated);
    }

    public async Task Handle(UpdateOrganizationStatusCommand request, CancellationToken ct)
    {
        var org = await repo.GetByIdAsync(request.OrganizationId, ct)
            ?? throw new NotFoundException($"Không tìm thấy tổ chức #{request.OrganizationId}.");

        await repo.UpdateStatusAsync(org.Id, request.Status, ct);
    }

    private static OrganizationDto ToDto(Organization x) =>
        new(x.Id, x.Name, x.Type, x.Status, x.CreatedAt);
}
