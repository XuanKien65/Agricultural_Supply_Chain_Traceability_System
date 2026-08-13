using AgriTrace.API;
using AgriTrace.Application;
using AgriTrace.Infrastructure.Sqlserver;

var builder = WebApplication.CreateBuilder(args);

// Presentation layer (Controller + Exception + CORS + JWT)
builder.Services.AddPresentation(builder.Configuration);

// Application layer
builder.Services.AddApplication();

// Infrastructure SQL Server layer
builder.Services.AddInfrastructureSqlServer(builder.Configuration);

// OpenAPI / Swagger với JWT Bearer support
builder.Services.AddSwaggerWithJwt();

var app = builder.Build();

app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// CORS phải nằm trước Authentication, Authorization và MapControllers.
app.UseCors(AgriTrace.API.DependencyInjection.FrontendCorsPolicy);

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();