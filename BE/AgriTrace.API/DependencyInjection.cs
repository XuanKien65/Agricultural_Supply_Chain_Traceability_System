using System.Reflection;
using AgriTrace.API.Common;
using Mapster;

namespace AgriTrace.API;

public static class DependencyInjection
{
    public const string FrontendCorsPolicy = "FrontendCors";

    public static IServiceCollection AddPresentation(
        this IServiceCollection services)
    {
        services.AddControllers(options =>
        {
            options.Filters.Add<ApiResponseWrapperFilter>();
        });

        services.AddExceptionHandler<GlobalExceptionHandler>();

        services.AddProblemDetails();

        // Cho phép React FE localhost:5173 gọi sang Backend.
        services.AddCors(options =>
        {
            options.AddPolicy(
                FrontendCorsPolicy,
                policy =>
                {
                    policy
                        .WithOrigins(
                            "http://localhost:5173",
                            "https://localhost:5173")
                        .AllowAnyHeader()
                        .AllowAnyMethod();
                });
        });

        var config = TypeAdapterConfig.GlobalSettings;

        config.Scan(Assembly.GetExecutingAssembly());

        return services;
    }
}