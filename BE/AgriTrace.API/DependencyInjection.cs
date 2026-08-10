using System.Reflection;
using AgriTrace.API.Common;
using Mapster;
using Microsoft.Extensions.DependencyInjection;

namespace AgriTrace.API
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddPresentation(this IServiceCollection services)
        {
            // Register API controllers + tự động bọc mọi kết quả vào ApiResponse.
            services.AddControllers(options =>
            {
                options.Filters.Add<ApiResponseWrapperFilter>();
            });

            // Chuyển mọi exception chưa xử lý thành envelope ApiResponse.
            services.AddExceptionHandler<GlobalExceptionHandler>();
            services.AddProblemDetails();

            // Set up Mapster configurations for API
            var config = TypeAdapterConfig.GlobalSettings;
            config.Scan(Assembly.GetExecutingAssembly());

            return services;
        }
    }
}
