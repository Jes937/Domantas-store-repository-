using Infrastructure;
using LinqToDB;

var builder = WebApplication.CreateBuilder(args);

// Database
var options = new DataOptions().UseSQLite(
    Environment.GetEnvironmentVariable("DB") ?? "Data Source=dev.db");

builder.Services.AddSingleton(new DataOptions<UserDataBase>(options));
builder.Services.AddScoped<UserDataBase>();

// Enable controllers
builder.Services.AddControllers();

// Swagger documentation (NSwag)
builder.Services.AddOpenApiDocument(config =>
{
    config.Title = "Business Esbjerg Holiday API";
});

// Allow the React client to call the API
var clientOrigin = builder.Configuration["ClientOrigin"] ?? "http://localhost:3000";
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins(clientOrigin)
            .AllowAnyHeader()
            .AllowAnyMethod());
});

var app = builder.Build();

// Create the tables on startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<UserDataBase>();
    Seeder.Seed(db);
}

// Swagger UI
app.UseOpenApi();
app.UseSwaggerUi();

app.UseCors();
app.MapControllers();

app.Run();

// Needed for integration tests
public partial class Program { }