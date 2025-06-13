namespace Enroll.DTOs
{
    public class CreateTestDto
    {
    public string Name { get; set; } = string.Empty;
    public int Time { get; set; }
    public List<TestQuestionDto> Questions { get; set; } = new List<TestQuestionDto>();
    }
}