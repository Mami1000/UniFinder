using System.Text;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Enroll.DbContext;
using Enroll.Extensions;
using Enroll.Interfaces;
using Enroll.Models;
using Enroll.Providers;
using Enroll.Repositories;
using Enroll.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using MongoDB.Driver;

var builder = WebApplication.CreateBuilder(args);

//  MongoDB подключение
var mongoDbConnectionString = builder.Configuration["ConnectionStrings:Project20Database"];
if (string.IsNullOrEmpty(mongoDbConnectionString))
    throw new Exception("MongoDB connection string must be provided in configuration.");

//  JWT конфигурация
var jwtSecretKey = builder.Configuration["JwtSecretKey"];
var jwtIssuer = builder.Configuration["JwtIssuer"];
var jwtAudience = builder.Configuration["JwtAudience"];

if (string.IsNullOrEmpty(jwtSecretKey) || string.IsNullOrEmpty(jwtIssuer) || string.IsNullOrEmpty(jwtAudience))
    throw new Exception("JwtSecretKey, JwtIssuer, and JwtAudience must be provided in configuration.");

var key = Encoding.UTF8.GetBytes(jwtSecretKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = jwtIssuer,
        ValidateAudience = true,
        ValidAudience = jwtAudience,
        ClockSkew = TimeSpan.Zero
    };
    options.Events = new JwtBearerEvents
    {
        OnAuthenticationFailed = context =>
        {
            Console.WriteLine($"[Auth Failed] {context.Exception.Message}");
            return Task.CompletedTask;
        },
        OnChallenge = context =>
        {
            Console.WriteLine("[Auth Challenge Triggered]");
            return Task.CompletedTask;
        },
        OnTokenValidated = context =>
        {
            Console.WriteLine("[Auth] Token successfully validated");
            return Task.CompletedTask;
        }
    };
});

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp", policy =>
    {
        policy.WithOrigins(builder.Configuration["ClientBaseUrl"]!)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

//  Azure Blob Storage
builder.Services.AddSingleton(x =>
{
    var config = x.GetRequiredService<IConfiguration>();
    var connectionString = config["AzureBlobStorage:ConnectionString"];
    if (string.IsNullOrEmpty(connectionString))
        throw new Exception("Azure Blob Storage connection string is missing.");
    return new BlobServiceClient(connectionString);
});

builder.Services.AddSingleton(x =>
{
    var config = x.GetRequiredService<IConfiguration>();
    var serviceClient = x.GetRequiredService<BlobServiceClient>();
    var containerName = config["AzureBlobStorage:ContainerName"];
    if (string.IsNullOrEmpty(containerName))
        throw new Exception("Azure Blob container name is missing.");
    var containerClient = serviceClient.GetBlobContainerClient(containerName);
    containerClient.CreateIfNotExists(PublicAccessType.None);
    return containerClient;
});

//  Вся инфраструктура и контроллеры
builder.Services.AddProjectInfrastructure(builder.Configuration);
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
});
builder.Services.AddMemoryCache();
builder.Services.AddEndpointsApiExplorer();

//  Swagger + JWT auth
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Enroll API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Введите JWT токен: Bearer {token}",
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});
 //Запускаю приложение
var app = builder.Build();

//  Swagger только в dev
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

//  Middleware pipeline
app.UseHttpsRedirection();
app.UseCors("AllowAngularApp");

// 📁 Локальные вложения (если есть)
var attachmentsPath = Path.Combine(Directory.GetCurrentDirectory(), "attachments");
if (Directory.Exists(attachmentsPath))
{
    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new PhysicalFileProvider(attachmentsPath),
        RequestPath = "/attachments"
    });
}
else
{
    Console.WriteLine($"[Warning] Attachments folder not found: {attachmentsPath}");
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.Run();
