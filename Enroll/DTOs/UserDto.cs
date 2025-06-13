using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Enroll.Models
{
    // Модель для отображения пользователя в системе.
    public class UserDto
    {
        /// Уникальный идентификатор пользователя
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = string.Empty;
        
        public string Name { get; set; } = string.Empty;
        public string Surname { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
    }
}
