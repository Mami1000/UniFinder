using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Enroll.Models
{
    public class User
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = null!;

        public string Name { get; set; } = null!;
        public string Surname { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Password { get; set; } = null!;
        public string Role { get; set; } = null!;
        public string PhotoURL { get; set; } = string.Empty;
        public int Userpoint { get; set; } = 0;
        public string? RefreshToken { get; set; }
        public DateTime? RefreshTokenExpiry { get; set; }
            
    }
}
