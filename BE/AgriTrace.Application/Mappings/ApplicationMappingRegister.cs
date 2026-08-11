using AgriTrace.Application.Contracts;
using AgriTrace.Domain.Entities;
using Mapster;

namespace AgriTrace.Application.Mappings
{
    public class ApplicationMappingRegister : IRegister
    {
        public void Register(TypeAdapterConfig config)
        {
            // Quan hệ 1 - N: Farm -> FarmDto (kèm danh sách Crop) và Crop -> CropDto.
            config.NewConfig<Farm, FarmDto>();
            config.NewConfig<Crop, CropDto>();

            // Add custom mapping rules here as the application grows.
        }
    }
}
