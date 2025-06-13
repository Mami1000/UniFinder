using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace  Enroll.Models
{
    public class PhotoHash
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = null!;
        public string Hash { get; set; } = null!;
        public string FileName { get; set; } = null!;
    }
}