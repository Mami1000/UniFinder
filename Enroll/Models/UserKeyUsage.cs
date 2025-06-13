namespace Enroll.Models
{
    public class UserKeyUsage
    {
        public string Id { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public int Count { get; set; }
        public List<string> Keys { get; set; } = new List<string>();
    }
}
