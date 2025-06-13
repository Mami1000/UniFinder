using Enroll.Models;
using System.Collections.Generic;

namespace Enroll.DTOs
{
    // Временная структура для передачи данных о тесте.
    public class FinishTestDto
    {
        public string? SessionId { get; set; }

        public List<CandidateAnswer> Answers { get; set; } = new List<CandidateAnswer>();

        public string? UserId { get; set; } 
    }
}
