using System;
using System.Threading;
using System.Threading.Tasks;
using AgriTrace.Application.Contracts;
using AgriTrace.Domain.Interfaces;
using Mapster;
using MediatR;

namespace AgriTrace.Application.Features.Farms.Queries
{
    // Use-case: lấy một nông trại kèm toàn bộ mùa vụ của nó (quan hệ 1 - N).
    public record GetFarmByIdQuery(Guid FarmId) : IRequest<FarmDto?>;

    public class GetFarmByIdQueryHandler : IRequestHandler<GetFarmByIdQuery, FarmDto?>
    {
        private readonly IFarmService _farmService;

        public GetFarmByIdQueryHandler(IFarmService farmService)
        {
            _farmService = farmService;
        }

        public async Task<FarmDto?> Handle(GetFarmByIdQuery request, CancellationToken cancellationToken)
        {
            var farm = await _farmService.GetFarmByIdAsync(request.FarmId);
            return farm?.Adapt<FarmDto>();
        }
    }
}
