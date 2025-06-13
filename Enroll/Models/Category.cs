using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace Enroll.Models
{
    public class Category
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        [BindNever]  // Не связываем это поле с входящими данными
        public string? Id { get; set; }

        // Добавляем явное сопоставление с JSON-полем "name"
        [BsonElement("name")]
        [JsonPropertyName("name")]
        public string Name { get; set; } = null!;

        public string? Description { get; set; }
    }
}
