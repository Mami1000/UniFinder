using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Enroll.Models
{
    // Модель для хранения токена сброса пароля
    public class PasswordResetToken
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; } 

        public string UserId { get; set; } = string.Empty;
        public string Token { get; set; } = string.Empty;
        public bool IsUsed { get; set; } = false;
        public DateTime CreatedAt { get; set; }
        public DateTime ExpiresAt { get; set; }
    }
}
