using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Collections.Generic;

namespace Enroll.Models
{
    public class Test
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = null!;

        public string Name { get; set; } = string.Empty;

        public List<TestQuestion> Questions { get; set; } = new List<TestQuestion>();

        public int Time { get; set; }
    }
}