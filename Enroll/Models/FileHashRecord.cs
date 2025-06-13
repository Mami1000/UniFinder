using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Enroll.Models
{
  public class FileHashRecord
    {
      [BsonId]  
      [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; } 
        public string? UserId { get; set; }  
        public string? FileHash { get; set; }
        public string? FileName { get; set; }
        public DateTime UploadedAt { get; set; }
    }

}