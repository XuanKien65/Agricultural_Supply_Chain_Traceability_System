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

        // Distributed Cache (Redis if configured, otherwise Memory)
        var redisConn = configuration.GetConnectionString("Redis") ?? configuration["Redis:ConnectionString"];
        if (!string.IsNullOrWhiteSpace(redisConn))
        {
            services.AddStackExchangeRedisCache(options =>
            {
                options.Configuration = redisConn;
                options.InstanceName = "AgriTrace_";
            });
        }
        else
        {
            services.AddDistributedMemoryCache();
        }

        services.AddScoped<ICacheService, RedisCacheService>();

        services.AddScoped<IOrganizationRepository, OrganizationRepository>();
        services.AddScoped<IProductRepository, ProductRepository>();
        services.AddScoped<IBatchRepository, BatchRepository>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
        services.AddScoped<IJwtTokenService, JwtTokenService>();

        // Person 3 Repositories
        services.AddScoped<IInspectionRepository, InspectionRepository>();
        services.AddScoped<ICertificateRepository, CertificateRepository>();
        services.AddScoped<IRecallRepository, RecallRepository>();
        services.AddScoped<INotificationRepository, NotificationRepository>();
        services.AddScoped<IPublicTraceRepository, PublicTraceRepository>();
        services.AddScoped<IAnalyticsRepository, AnalyticsRepository>();

        // Admin CRUD repositories
        services.AddScoped<IAdminRepository, AdminRepository>();
        services.AddScoped<IAdminCrudRepository, AdminCrudRepository>();
        services.AddScoped<IRecallNotificationRepository, RecallNotificationRepository>();

        return services;
    }
}
