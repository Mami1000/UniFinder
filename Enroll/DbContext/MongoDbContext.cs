using MongoDB.Driver;
using Enroll.Models;
using Enroll.Interfaces;

namespace Enroll.DbContext
{
    public class MongoDbContext : IMongoDbContext
    {
        private readonly IMongoDatabase _database;


        public MongoDbContext(IConfiguration configuration)
        {
            var connectionString = configuration["ConnectionStrings:Project20Database"];
            if (string.IsNullOrEmpty(connectionString))
            {
                throw new Exception("MongoDB строка подключения не найдена.");
            }

            var client = new MongoClient(connectionString);
            _database = client.GetDatabase("Project20Database");
        }
        public IMongoDatabase Database => _database; // ← доступ ко всей базе данных
        public IMongoCollection<User> Users => _database.GetCollection<User>("Users");// ← доступ к коллекции пользователей

        public IMongoCollection<University> Universities => _database.GetCollection<University>("Universities"); // ← доступ к коллекции университетов
        public IMongoCollection<Test> Tests => _database.GetCollection<Test>("Tests");// ← доступ к коллекции тестов
        public IMongoCollection<TestSession> TestSessions => _database.GetCollection<TestSession>("TestSessions");// ← доступ к коллекции сессий тестов
        public IMongoCollection<UserKeyUsage> UserKeyUsage => _database.GetCollection<UserKeyUsage>("UserKeyUsage");// ← доступ к коллекции использования ключей пользователями
        public IMongoCollection<Question> Questions => _database.GetCollection<Question>("Questions"); // ← доступ к коллекции вопросов
        public IMongoCollection<Category> Categories => _database.GetCollection<Category>("Categories");// ← доступ к коллекции категорий
        public IMongoCollection<FileHashRecord> FileHashes => _database.GetCollection<FileHashRecord>("FileHashes");// ← доступ к коллекции хешей файлов
        public IMongoCollection<Profession> Professions => _database.GetCollection<Profession>("Professions");// ← доступ к коллекции профессий
        public IMongoCollection<UserProfile> UserProfiles => _database.GetCollection<UserProfile>("UserProfiles");
        public IMongoCollection<RefreshToken> RefreshTokens => _database.GetCollection<RefreshToken>("RefreshTokens");




    }
}
