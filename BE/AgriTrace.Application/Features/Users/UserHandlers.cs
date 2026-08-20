using AgriTrace.Application.Common.Exceptions;
using AgriTrace.Domain.Common;
using AgriTrace.Domain.Entities;
using AgriTrace.Domain.Interfaces;
using MediatR;

namespace AgriTrace.Application.Features.Users;

public record UserDto(
    int UserId,
    string? FullName,
    string Email,
    string Role,
    int? OrganizationId,
    string? OrganizationName,
    bool IsActive,
    DateTime CreatedAt);

public record GetUsersQuery(
    int? OrganizationId, string? Role, bool? IsActive, string? Search, int Page = 1, int PageSize = 20) : IRequest<PagedResult<UserDto>>;

public record GetUserByIdQuery(int UserId) : IRequest<UserDto>;
public record CreateUserCommand(int? OrganizationId, string Role, string? FullName, string Email, string Password) : IRequest<UserDto>;
public record UpdateUserCommand(int UserId, string? FullName, string Role) : IRequest<UserDto>;
public record UpdateUserStatusCommand(int UserId, bool IsActive) : IRequest;

public sealed class UserQueryCommandHandler(IUserRepository repo)
    : IRequestHandler<GetUsersQuery, PagedResult<UserDto>>,
      IRequestHandler<GetUserByIdQuery, UserDto>,
      IRequestHandler<CreateUserCommand, UserDto>,
      IRequestHandler<UpdateUserCommand, UserDto>,
      IRequestHandler<UpdateUserStatusCommand>
{
    public async Task<PagedResult<UserDto>> Handle(GetUsersQuery request, CancellationToken ct)
    {
        var result = await repo.GetAllPagedAsync(
            request.OrganizationId, request.Role, request.IsActive, request.Search, request.Page, request.PageSize, ct);

        var dtos = result.Items.Select(ToDto).ToList();
        return new PagedResult<UserDto>(dtos, result.TotalCount);
    }

    public async Task<UserDto> Handle(GetUserByIdQuery request, CancellationToken ct)
    {
        var user = await repo.GetByIdAsync(request.UserId, ct)
            ?? throw new NotFoundException($"Không tìm thấy người dùng #{request.UserId}.");

        return ToDto(user);
    }

    public async Task<UserDto> Handle(CreateUserCommand request, CancellationToken ct)
    {
        var existing = await repo.GetByEmailAsync(request.Email, ct);
        if (existing is not null)
            throw new ArgumentException($"Email '{request.Email}' đã tồn tại trong hệ thống.");

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password, workFactor: 11);

        var user = new User(
            id: 0,
            fullName: request.FullName,
            email: request.Email,
            passwordHash: passwordHash,
            role: request.Role,
            organizationId: request.OrganizationId,
            isActive: true);

        var created = await repo.AddAsync(user, ct);
        return ToDto(created);
    }

    public async Task<UserDto> Handle(UpdateUserCommand request, CancellationToken ct)
    {
        var user = await repo.GetByIdAsync(request.UserId, ct)
            ?? throw new NotFoundException($"Không tìm thấy người dùng #{request.UserId}.");

        user.UpdateProfile(request.FullName, request.Role);
        var updated = await repo.UpdateAsync(user, ct);
        return ToDto(updated);
    }

    public async Task Handle(UpdateUserStatusCommand request, CancellationToken ct)
    {
        var user = await repo.GetByIdAsync(request.UserId, ct)
            ?? throw new NotFoundException($"Không tìm thấy người dùng #{request.UserId}.");

        await repo.UpdateStatusAsync(user.Id, request.IsActive, ct);
    }

    private static UserDto ToDto(User x) => new(
        x.Id,
        x.FullName,
        x.Email,
        x.Role,
        x.OrganizationId,
        x.OrganizationName,
        x.IsActive,
        x.CreatedAt);
}
