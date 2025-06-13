using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Enroll.DTOs
{
    public class UniversityDto
    {
        public string? Id { get; set; }
        public string Name { get; set; } = null!;
        public string Location { get; set; } = null!;
        public string? Description { get; set; }
        public List<string> Courses { get; set; } = new();
        public string? LogoUrl { get; set; }
    }
}
