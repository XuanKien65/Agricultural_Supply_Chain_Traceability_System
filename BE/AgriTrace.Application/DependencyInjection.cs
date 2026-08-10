using System.Reflection;
using AgriTrace.Domain.Interfaces;
using AgriTrace.Domain.Services;
using Mapster;
using MapsterMapper;
using Microsoft.Extensions.DependencyInjection;

namespace AgriTrace.Application
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddApplication(this IServiceCollection services)
        {
            // Register MediatR
            services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly()));

            // Register Mapster Config
            var config = TypeAdapterConfig.GlobalSettings;
            config.Scan(Assembly.GetExecutingAssembly());
            services.AddSingleton(config);
            services.AddScoped<IMapper, Mapper>();

            // Register Domain Services (Commands/Queries gọi qua Domain, Domain gọi Repository)
            services.AddScoped<IFarmService, FarmService>();

            return services;
        }
    }
}
