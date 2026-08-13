using System.Reflection;
using System.Text;
using AgriTrace.API.Common;
using Mapster;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

namespace AgriTrace.API;

public static class DependencyInjection
{
    public const string FrontendCorsPolicy = "FrontendCors";

    public static IServiceCollection AddPresentation(
        this IServiceCollection services,
        IConfiguration configuration)
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
                            "https://localhost:5173",
                            "http://localhost:3000",
                            "http://127.0.0.1:5173")
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials();
                });
        });

        // ---- JWT Authentication ----
        var jwtSettings = configuration.GetSection("JwtSettings");
        var secret = jwtSettings["Secret"]
            ?? throw new InvalidOperationException("JwtSettings:Secret is not configured.");

        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = jwtSettings["Issuer"] ?? "AgriTrace",
                ValidAudience = jwtSettings["Audience"] ?? "AgriTraceClients",
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret)),
                ClockSkew = TimeSpan.Zero
            };
        });

        services.AddAuthorization();

        var config = TypeAdapterConfig.GlobalSettings;
        config.Scan(Assembly.GetExecutingAssembly());

        return services;
    }

    public static IServiceCollection AddSwaggerWithJwt(this IServiceCollection services)
    {
        services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc("v1", new OpenApiInfo
            {
                Title = "AgriTrace API",
                Version = "v1",
                Description = "Agricultural Supply Chain Traceability System API"
            });

            var securityScheme = new OpenApiSecurityScheme
            {
                Name = "Authorization",
                Description = "Nhập JWT theo định dạng: Bearer {token}",
                In = ParameterLocation.Header,
                Type = SecuritySchemeType.Http,
                Scheme = "bearer",
                BearerFormat = "JWT",
                Reference = new OpenApiReference
                {
                    Id = JwtBearerDefaults.AuthenticationScheme,
                    Type = ReferenceType.SecurityScheme
                }
            };

            options.AddSecurityDefinition(JwtBearerDefaults.AuthenticationScheme, securityScheme);
            options.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                { securityScheme, Array.Empty<string>() }
            });
        });

        return services;
    }
}