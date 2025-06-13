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
using MongoDB.Driver;

var builder = WebApplication.CreateBuilder(args);

// MongoDB
var mongoDbConnectionString = builder.Configuration["ConnectionStrings:Project20Database"];
if (string.IsNullOrEmpty(mongoDbConnectionString))
    throw new Exception("MongoDB connection string must be provided in configuration.");

// JWT
var jwtSecretKey = builder.Configuration["JwtSecretKey"];
if (string.IsNullOrEmpty(jwtSecretKey))
    throw new Exception("JwtSecretKey must be provided in configuration.");

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
        ValidateIssuer = false,
        ValidateAudience = false,
        ClockSkew = TimeSpan.Zero
    };
});

// CORS
// builder.Services.AddCors(options =>
// {
//     options.AddPolicy("AllowAll", policy =>
//     {
//         policy.AllowAnyOrigin()
//               .AllowAnyMethod()
//               .AllowAnyHeader();
//     });
// });

//для продакшна 
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp", policy =>
    {
        policy.WithOrigins("https://delightful-grass-09a0e510f.6.azurestaticapps.net")
              .AllowAnyHeader()
              .AllowAnyMethod();
              //.AllowCredentials(); 
    });
});

// BlobStorage: Регистрация клиента
builder.Services.AddSingleton(x =>
{
    var config = x.GetRequiredService<IConfiguration>();
    var connectionString = config["AzureBlobStorage:ConnectionString"];
    return new BlobServiceClient(connectionString);
});

builder.Services.AddSingleton(x =>
{
    var config = x.GetRequiredService<IConfiguration>();
    var serviceClient = x.GetRequiredService<BlobServiceClient>();
    var containerName = config["AzureBlobStorage:attachments"];
    var containerClient = serviceClient.GetBlobContainerClient(containerName);
    containerClient.CreateIfNotExists(PublicAccessType.None);
    return containerClient;
});

// Остальная инфраструктура
builder.Services.AddProjectInfrastructure(builder.Configuration);
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
});
builder.Services.AddMemoryCache();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowAngularApp");

// Static files — если используешь старые attachments (можно убрать позже)
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
