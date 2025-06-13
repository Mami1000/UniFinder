using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Collections.Generic;

namespace Enroll.Models
{
    public class UserProfile
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = null!;

        [BsonElement("userId")]
        public string UserId { get; set; } = null!;

        [BsonElement("categoryScores")]
        public List<CategoryScore> CategoryScores { get; set; } = new();
    }

    public class CategoryScore
    {
        [BsonElement("category")]
        public string Category { get; set; } = null!;

        [BsonElement("correctAnswers")]
        public int CorrectAnswers { get; set; }

        [BsonElement("totalQuestions")]
        public int TotalQuestions { get; set; }

        [BsonIgnore]
        public double Accuracy => TotalQuestions == 0 ? 0 : (double)CorrectAnswers / TotalQuestions;
    }
}
