using System;
using AgriTrace.API.Models;
using AgriTrace.Application.Contracts;
using AgriTrace.Application.Features.Crops.Commands;
using AgriTrace.Application.Features.Farms.Commands;
using AgriTrace.Application.Features.Farms.Queries;
using Mapster;

namespace AgriTrace.API.Mappings
{
    // Ánh xạ giữa model của tầng API (Request/Response) và Command/Query/DTO của tầng Application.
    public class ApiMappingRegister : IRegister
    {
        public void Register(TypeAdapterConfig config)
        {
            // Request -> Command/Query
            config.NewConfig<FarmRequest, CreateFarmCommand>();
            config.NewConfig<Guid, GetFarmByIdQuery>()
                  .MapWith(id => new GetFarmByIdQuery(id));
            config.NewConfig<PaginationRequest, GetFarmsQuery>();
            config.NewConfig<CropRequest, CreateCropCommand>();

            // DTO -> Response
            config.NewConfig<FarmDto, FarmResponse>();
            config.NewConfig<CropDto, CropResponse>();
        }
    }
}
