namespace Enroll.Models
{
    public class CategoryResult
    {
        public string Category { get; set; } = null!;
        public int Correct { get; set; }
        public int Total { get; set; }
    }
}