using AgriTrace.API;
using AgriTrace.Application;
using AgriTrace.Infrastructure.Sqlserver;

var builder = WebApplication.CreateBuilder(args);

// Controller + Exception + CORS
builder.Services.AddPresentation();

// Application
builder.Services.AddApplication();

// SQL Server
builder.Services.AddInfrastructureSqlServer(
    builder.Configuration);

// Swagger
builder.Services.AddOpenApi();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();

    app.UseSwagger();

    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// QUAN TRỌNG:
// CORS phải nằm trước Authorization và MapControllers.
app.UseCors(
    AgriTrace.API.DependencyInjection.FrontendCorsPolicy);

app.UseAuthorization();

app.MapControllers();

app.Run();