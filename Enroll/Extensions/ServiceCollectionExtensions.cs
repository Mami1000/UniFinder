using Enroll.DbContext;
using Enroll.Interfaces;
using Enroll.Models;
using Enroll.Providers;
using Enroll.Repositories;
using Enroll.Services;
using MongoDB.Driver;

namespace Enroll.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddProjectInfrastructure(this IServiceCollection services, IConfiguration config)
        {
            var mongoClient = new MongoClient(config.GetConnectionString("Project20Database"));// MongoDB client for the application
            var database = mongoClient.GetDatabase("Project20Database");// MongoDB database for the application

            services.AddSingleton<IMongoClient>(mongoClient);// MongoDB client for the application
            services.AddSingleton(database);// MongoDB database instance for the application
            services.AddSingleton<IMongoDbContext, MongoDbContext>();// MongoDbContext for MongoDB operations
            services.AddSingleton(database.GetCollection<Enroll.Models.UserKeyUsage>("UserKeyUsage"));// UserKeyUsage collection for tracking user key usage
            services.AddSingleton(database.GetCollection<PasswordResetToken>("PasswordResetTokens"));// PasswordResetToken collection for password reset tokens

            var encryptionKey = config["PhotoEncryptionKey"] ?? throw new ArgumentNullException("PhotoEncryptionKey", "PhotoEncryptionKey configuration value is missing.");
            services.AddSingleton<IEncryptionService>(new AesEncryptionService(encryptionKey));//   AesEncryptionService for encrypting and decrypting sensitive data
            services.AddSingleton<IFileRepository, FileSystemRepository>();// FileSystemRepository for handling file storage
            services.AddSingleton<IFileHashRepository, FileHashRepository>();// FileHashRepository for handling file hashes
            services.AddScoped<IMediaService, MediaService>();// MediaService for handling media files
            services.AddTransient<IEmailService, EmailService>();// EmailService for sending emails

            services.AddSingleton<IContentTypeProvider, ContentTypeProvider>();// ContentTypeProvider for handling content types

            services.AddScoped<IUserQueryService, UserService>();// UserService for user queries
            services.AddScoped<IUserCommandService, UserService>();//   UserService for user management
            services.AddSingleton<IResetPasswordTrackerService, ResetPasswordTrackerService>();// ResetPasswordTrackerService for tracking password reset requests

            services.AddScoped<IUniversityReaderService, UniversityService>();// UniversityService for reading universities
            services.AddScoped<IUniversityWriterService, UniversityService>();// UniversityService for handling universities
            services.AddScoped<ITestService, TestService>();// TestService for handling tests
            services.AddSingleton<ICategoryServices, CategoryServices>();// CategoryServices for handling categories
            services.AddSingleton<IQuestionServices, QuestionServices>();// QuestionServices for handling questions
            services.AddScoped<IProfessionService, ProfessionService>();// ProfessionService for handling professions
            services.AddScoped<IRecommendationService, RecommendationService>();// RecommendationService for handling recommendations
            services.AddSingleton(database.GetCollection<UserProfile>("UserProfiles"));// UserProfile collection for user profiles
            services.AddScoped<ITokenService, TokenService>();// TokenService for JWT handling
            services.AddScoped<IAuthService, AuthService>();// AuthService for authentication operations
            
        
            return services;
        }
    }
}