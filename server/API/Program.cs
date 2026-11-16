using Infrastructure;
using LinqToDB;
using LinqToDB.Data;
using Security.Services.Security;
using Service;

var builder = WebApplication.CreateBuilder(args);

// Database
var dbOptions = new DataOptions().UseSQLite(
    Environment.GetEnvironmentVariable("DB") ?? "Data Source=holiday.db");

builder.Services.AddSingleton(new DataOptions<UserDataBase>(dbOptions));
builder.Services.AddScoped<UserDataBase>();

builder.Services.AddScoped<DataConnection>(sp => sp.GetRequiredService<UserDataBase>());
builder.Services.AddScoped<Argon2PasswordHasher>();
builder.Services.AddScoped<UserService>();

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

// Swagger documentation (NSwag) with an Authorize button
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