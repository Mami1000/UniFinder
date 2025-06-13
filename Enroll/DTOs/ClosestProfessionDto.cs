namespace Enroll.DTOs
{
    public class ClosestProfessionDto
    {
        public string Name { get; set; } = null!;
        public string Faculty { get; set; } = null!;
        public string Type { get; set; } = null!;
        public double MinScore { get; set; }
        public string University { get; set; } = null!;
        public string Location { get; set; } = null!;
        public string? LogoUrl { get; set; }
    }
}
