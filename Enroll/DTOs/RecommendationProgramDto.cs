namespace Enroll.DTOs
{
    public class RecommendationProgramDto
    {
        public string Name { get; set; } = null!;
        public string Faculty { get; set; } = null!;
        public string Type { get; set; } = null!;
        public double MinScore { get; set; }
    }

    public class RecommendationResult
    {
        public string University { get; set; } = null!;
        public string Location { get; set; } = null!;
        public string? LogoUrl { get; set; }
        public string? Description { get; set; }
        public List<RecommendationProgramDto> Programs { get; set; } = new();
    }
}
