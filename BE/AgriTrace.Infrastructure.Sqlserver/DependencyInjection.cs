using AgriTrace.Domain.Interfaces;
using AgriTrace.Infrastructure.Sqlserver.Persistence;
using AgriTrace.Infrastructure.Sqlserver.Repositories;
using AgriTrace.Infrastructure.Sqlserver.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace AgriTrace.Infrastructure.Sqlserver;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureSqlServer(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseSqlServer(connectionString));

        services.AddScoped<IOrganizationRepository, OrganizationRepository>();
        services.AddScoped<IProductRepository, ProductRepository>();
        services.AddScoped<IBatchRepository, BatchRepository>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IJwtTokenService, JwtTokenService>();

        // READ + USER CRUD
        services.AddScoped<IAdminRepository, AdminRepository>();
        // CRUD các bảng Admin còn lại
        services.AddScoped<IAdminCrudRepository, AdminCrudRepository>();
        services.AddScoped<IRecallNotificationRepository, RecallNotificationRepository>();

        return services;
    }
}
