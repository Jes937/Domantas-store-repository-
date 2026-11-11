var builder = WebApplication.CreateBuilder(args);

//Enable controllers
builder.Services.AddControllers();

//Swagger documentation (NSwag)
builder.Services.AddOpenApiDocument(config =>
{
    config.Title = "Business Esbjerg Holiday API";
});

//Allow the React client to call the API
var clientOrigin = builder.Configuration["ClientOrigin"] ?? "http://localhost:3000";
builder.Services.AddCors(options =>
    {
        options.AddDefaultPolicy(policy =>
            policy.WithOrigins(clientOrigin)
                .AllowAnyHeader()
                .AllowAnyMethod());
    });
    
var app = builder.Build();

//Swagger UI    
app.UseOpenApi();
app.UseSwaggerUi();
    
app.UseCors();
app.MapControllers();
    
app.Run();