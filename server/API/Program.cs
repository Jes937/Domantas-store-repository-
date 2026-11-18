using Infrastructure;
using Infrastructure.Enums;
using LinqToDB;
using LinqToDB.Data;
using Security.Services.Security;
using Service;
using LoginApi.Services;

var builder = WebApplication.CreateBuilder(args);

// Database
var dbOptions = new DataOptions().UseSQLite(
    Environment.GetEnvironmentVariable("DB") ?? "Data Source=holiday.db");

builder.Services.AddSingleton(new DataOptions<UserDataBase>(dbOptions));
builder.Services.AddScoped<UserDataBase>();
builder.Services.AddScoped<DataConnection>(sp => sp.GetRequiredService<UserDataBase>());

// Services
builder.Services.AddScoped<Argon2PasswordHasher>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<TokenServices>();
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<WorkScheduleService>();

// Authentication (JWT)
builder.Services.AddAuthentication("Bearer").AddJwtBearer(o =>
{
    o.MapInboundClaims = false;
    o.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
    {
        ValidateIssuer = false,
        ValidateAudience = false,
        IssuerSigningKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(
            System.Text.Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)),
        RoleClaimType = "role"
    };
});
builder.Services.AddAuthorization();

// Enable controllers
builder.Services.AddControllers();

// Swagger documentation 
builder.Services.AddOpenApiDocument(config =>
{
    config.Title = "Business Esbjerg Holiday API";
    config.AddSecurity("JWT", Enumerable.Empty<string>(), new NSwag.OpenApiSecurityScheme
    {
        Type = NSwag.OpenApiSecuritySchemeType.ApiKey,
        Name = "Authorization",
        In = NSwag.OpenApiSecurityApiKeyLocation.Header,
        Description = "Type: Bearer {token}"
    });
    config.OperationProcessors.Add(
        new NSwag.Generation.Processors.Security.AspNetCoreOperationSecurityScopeProcessor("JWT"));
});

// Allow the React client to call the API
var clientOrigin = builder.Configuration["ClientOrigin"] ?? "http://localhost:3000";
builder.Services.AddCors(corsOptions =>
{
    corsOptions.AddDefaultPolicy(policy =>
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

    // Development only: one test user of each role, so there is someone to log in as
    if (app.Environment.IsDevelopment() && !db.GetTable<UserDB>().Any())
    {
        var hasher = scope.ServiceProvider.GetRequiredService<Argon2PasswordHasher>();

        var testUsers = new[]
        {
            ("Test Employee", "employee@businessesbjerg.com", Roles.Employee),
            ("Test Accountant", "accountant@businessesbjerg.com", Roles.Accountant),
            ("Test System Owner", "owner@businessesbjerg.com", Roles.SystemOwner),
        };

        foreach (var (name, email, role) in testUsers)
        {
            db.Insert(new UserDB
            {
                UserId = Guid.NewGuid().ToString(),
                UserName = name,
                Email = email,
                Password = hasher.HashAndSaltPassword("Password123"),
                Role = role,
                IsActive = true,
                StartDate = DateOnly.FromDateTime(DateTime.Today)
            });
        }
    }
}

// Swagger UI
app.UseOpenApi();
app.UseSwaggerUi();

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();

// Needed for integration tests
public partial class Program { }