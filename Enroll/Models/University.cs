namespace Enroll.Models;

public class University
{
    public string Id { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string Location { get; set; } = null!;
    public string? Description { get; set; }
    public List<string> Courses { get; set; } = new();
    public string? LogoUrl { get; set; }
}
