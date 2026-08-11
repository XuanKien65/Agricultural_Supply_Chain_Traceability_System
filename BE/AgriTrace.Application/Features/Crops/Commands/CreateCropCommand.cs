using System;
using System.Threading;
using System.Threading.Tasks;
using AgriTrace.Application.Contracts;
using AgriTrace.Domain.Interfaces;
using Mapster;
using MediatR;

namespace AgriTrace.Application.Features.Crops.Commands
{
    // Use-case: tạo mới một mùa vụ (phía "N") gắn với một nông trại đã có.
    // Dù Crop có endpoint/controller riêng, thao tác vẫn đi qua Aggregate Root (Farm) đúng nguyên tắc DDD.
    public record CreateCropCommand(
        Guid FarmId,
        string Name,
        decimal AreaHectares
    ) : IRequest<CropDto?>;

    public class CreateCropCommandHandler : IRequestHandler<CreateCropCommand, CropDto?>
    {
        private readonly IFarmService _farmService;

        public CreateCropCommandHandler(IFarmService farmService)
        {
            _farmService = farmService;
        }

        public async Task<CropDto?> Handle(CreateCropCommand request, CancellationToken cancellationToken)
        {
            // Quan hệ 1 - N được tạo trong Domain Service (đi qua Aggregate Root Farm).
            var crop = await _farmService.AddCropToFarmAsync(request.FarmId, request.Name, request.AreaHectares);
            return crop?.Adapt<CropDto>();
        }
    }
}
