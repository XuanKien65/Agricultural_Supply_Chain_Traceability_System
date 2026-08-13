using AgriTrace.Domain.Interfaces;
using MediatR;

namespace AgriTrace.Application.Features.Auth.Commands;

// ---- Request DTO ----
public record UpdateUserStatusCommand(int UserId, string Status) : IRequest;

// ---- Handler ----
public sealed class UpdateUserStatusCommandHandler(IUserRepository users)
    : IRequestHandler<UpdateUserStatusCommand>
{
    public async Task Handle(UpdateUserStatusCommand request, CancellationToken cancellationToken)
    {
        if (request.Status != "Active" && request.Status != "Inactive")
            throw new ArgumentException("Status must be 'Active' or 'Inactive'.");

        var user = await users.GetByIdAsync(request.UserId, cancellationToken)
            ?? throw new InvalidOperationException($"User '{request.UserId}' not found.");

        await users.UpdateStatusAsync(request.UserId, request.Status, cancellationToken);
    }
}
