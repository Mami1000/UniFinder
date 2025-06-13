namespace Enroll.DTOs
{
    public class RecommendationFullResult
    {
        public List<RecommendationResult> Recommendations { get; set; } = new();
        public ClosestProfessionDto? ClosestProfession { get; set; }
        public int NeededPoints { get; set; }
    }
    
}
