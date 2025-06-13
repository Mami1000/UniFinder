using System.ComponentModel.DataAnnotations;

namespace Enroll.DTOs
{
    public class LogoutRequestDto
    {
        [Required(ErrorMessage = "UserId обязателен.")]
        public string? UserId { get; set; }
    }

}