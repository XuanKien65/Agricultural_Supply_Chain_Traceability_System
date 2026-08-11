using AgriTrace.Domain.Interfaces;
using AgriTrace.Infrastructure.Sqlserver.Persistence;
using AgriTrace.Infrastructure.Sqlserver.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace AgriTrace.Infrastructure.Sqlserver
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructureSqlServer(this IServiceCollection services, IConfiguration configuration)
        {
            var connectionString = configuration.GetConnectionString("DefaultConnection");

            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseSqlServer(connectionString));

            services.AddScoped<IFarmRepository, FarmRepository>();

            return services;
        }
    }
}
