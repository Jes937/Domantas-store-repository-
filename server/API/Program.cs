using Infrastructure;
using Infrastructure.Enums;
using LinqToDB;
using Security.Services.Security;
using Service;
using LoginApi.Services;

var builder = WebApplication.CreateBuilder(args);

// Database
var options = new DataOptions().UseSQLite(
    Environment.GetEnvironmentVariable("DB") ?? "Data Source=dev.db");

builder.Services.AddSingleton(new DataOptions<UserDataBase>(options));
builder.Services.AddScoped<UserDataBase>();
builder.Services.AddScoped<Argon2PasswordHasher>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<TokenServices>();

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
    
    //For development only: add a test user, so there is someone to log in as
    if (app.Environment.IsDevelopment() && !db.GetTable<UserDB>().Any())
    {
        var hasher = scope.ServiceProvider.GetRequiredService<Argon2PasswordHasher>();

        db.Insert(new UserDB
        {
            UserId = Guid.NewGuid().ToString(),
            UserName = "Test Admin",
            Email = "admin@test.dk",
            Password = hasher.HashAndSaltPassword("Password123"),
            Role = Roles.Admin,
            IsActive = true,
            StartDate = DateOnly.FromDateTime(DateTime.Today)
        });
    }
}

// Swagger UI
app.UseOpenApi();
app.UseSwaggerUi();

app.UseCors();
app.MapControllers();

app.Run();

// Needed for integration tests
public partial class Program { }