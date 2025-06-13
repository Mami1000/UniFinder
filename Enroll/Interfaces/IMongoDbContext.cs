using Enroll.Models;
using MongoDB.Driver;

namespace Enroll.Interfaces
{
    public interface IMongoDbContext
    {
        IMongoCollection<User> Users { get; } // ← доступ к коллекции пользователей
        IMongoCollection<University> Universities { get; } // ← доступ к коллекции университетов
        IMongoDatabase Database { get; } // ← тут я получаю доступ ко всей базе данных, а выше - только к коллекциям
        IMongoCollection<Test> Tests { get; }// ← доступ к коллекции тестов
        IMongoCollection<TestSession> TestSessions { get; }// ← доступ к коллекции сессий тестов
        IMongoCollection<UserKeyUsage> UserKeyUsage { get; } // ← доступ к коллекции использования ключей пользователями
        IMongoCollection<Question> Questions { get; }// ← доступ к коллекции вопросов

        IMongoCollection<Category> Categories { get; }// ← доступ к коллекции категорий
        IMongoCollection<FileHashRecord> FileHashes { get; }// ← доступ к коллекции хешей файлов
        IMongoCollection<Profession> Professions { get; }// ← доступ к коллекции профессий
        IMongoCollection<UserProfile> UserProfiles { get; }// ← доступ к коллекции профилей пользователей
        IMongoCollection<RefreshToken> RefreshTokens { get; } // ← доступ к коллекции токенов обновления

    }
}