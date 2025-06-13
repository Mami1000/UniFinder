using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Microsoft.AspNetCore.Mvc.ModelBinding; 

namespace Enroll.Models
{
    public class Question
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        [BindNever] 
        public string? Id { get; set; }  
        
        public string Text { get; set; } = null!;
        public string Answer { get; set; } = null!;
        public string Note { get; set; } = string.Empty;
        [BsonRepresentation(BsonType.ObjectId)]
        public string CategoryId { get; set; } = null!;
        public string CategoryName { get; set; } = string.Empty;
        public int Point { get; set; } = 0; 
        public string? ImageUrl { get; set; }

    }
}
