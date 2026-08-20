using AgriTrace.Domain.Interfaces;
using MediatR;

namespace AgriTrace.Application.Features.Images.Commands;

public record UploadBatchImageCommand(int BatchId, string ImageUrl, string? Caption, int DisplayOrder, int? EventId) : IRequest;

public sealed class UploadBatchImageCommandHandler(IBatchRepository batches)
    : IRequestHandler<UploadBatchImageCommand>
{
    public async Task<Unit> Handle(UploadBatchImageCommand request, CancellationToken ct)
    {
        await batches.AddBatchImageAsync(request.BatchId, request.ImageUrl, request.Caption, request.DisplayOrder, request.EventId, ct);
        return Unit.Value;
    }
}
