using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Enroll.Models;

public class Profession
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    [BsonIgnoreIfNull]
    public string? Id { get; set; }

    [BsonElement("name")]
    public string Name { get; set; } = null!;

    [BsonElement("minScore")]
    public double MinScore { get; set; }

    [BsonElement("universityId")]
    public string UniversityId { get; set; } = null!;

    [BsonElement("faculty")]
    public string Faculty { get; set; } = null!;

    [BsonElement("type")]
    public string Type { get; set; } = null!;
    
    public List<string> RelatedCategories { get; set; } = new();

}
