using AgriTrace.API;
using AgriTrace.Application;
using AgriTrace.Infrastructure.Sqlserver;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

// Presentation layer (Controller + Exception + CORS + JWT)
builder.Services.AddPresentation(builder.Configuration);

// Application layer
builder.Services.AddApplication();

// Infrastructure SQL Server layer
builder.Services.AddInfrastructureSqlServer(builder.Configuration);

// Rate limiting for public endpoints (e.g. public trace)
builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("PublicTrace", limiterOptions =>
    {
        limiterOptions.PermitLimit = 60; // 60 requests
        limiterOptions.Window = TimeSpan.FromMinutes(1); // per minute per key (IP)
        limiterOptions.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        limiterOptions.QueueLimit = 0;
    });
    options.RejectionStatusCode = 429;
});

// OpenAPI / Swagger với JWT Bearer support
builder.Services.AddSwaggerWithJwt();

var app = builder.Build();

app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Use rate limiter before public endpoints are invoked
app.UseRateLimiter();

// CORS phải nằm trước Authentication, Authorization và MapControllers.
app.UseCors(AgriTrace.API.DependencyInjection.FrontendCorsPolicy);

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();