namespace Enroll.Models
{
    public class UpdateUserDto
    {
        public string Id { get; set; } = string.Empty; 
        public string Name { get; set; } = string.Empty;
        public string? Password { get; set; } 
        public string? PhotoURL { get; set; }
    }
}
