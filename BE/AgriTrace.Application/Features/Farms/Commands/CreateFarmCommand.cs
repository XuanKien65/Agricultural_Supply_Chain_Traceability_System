using System.Threading;
using System.Threading.Tasks;
using AgriTrace.Application.Contracts;
using AgriTrace.Domain.Interfaces;
using Mapster;
using MediatR;

namespace AgriTrace.Application.Features.Farms.Commands
{
    // Use-case: tạo mới một nông trại (phía "1").
    public record CreateFarmCommand(
        string Name,
        string Location
    ) : IRequest<FarmDto>;

    public class CreateFarmCommandHandler : IRequestHandler<CreateFarmCommand, FarmDto>
    {
        private readonly IFarmService _farmService;

        public CreateFarmCommandHandler(IFarmService farmService)
        {
            _farmService = farmService;
        }

        public async Task<FarmDto> Handle(CreateFarmCommand request, CancellationToken cancellationToken)
        {
            var addedFarm = await _farmService.CreateFarmAsync(request.Name, request.Location);
            return addedFarm.Adapt<FarmDto>();
        }
    }
}
