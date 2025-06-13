using System.Collections.Generic;
using System.Threading.Tasks;
using Enroll.Models;
using Enroll.DTOs;

namespace Enroll.Services
{
   public interface ITestService
    {
        Task<(int StatusCode, object Response)> CreateTestAsync(CreateTestDto newTestDto);
        Task<(int StatusCode, object Response)> GetTestByIdAsync(string id);
        Task<(int StatusCode, object Response)> GetAllTestsAsync();
        Task<(int StatusCode, object Response)> UpdateTestAsync(string id, Test updatedTest);
        Task<(int StatusCode, object Response)> DeleteTestAsync(string id);
        Task<(int StatusCode, object Response)> GenerateQuestionsForTestAsync(string id);
        Task<(int StatusCode, object Response)> CreateCodeForTestAsync(string testId, string userId);

        Task<(int StatusCode, object Response)> OpenTestAsync(string key, string testId);

        // Метод для завершения теста и сохранения результатов прохождения пользователем
        Task<(int StatusCode, object Response)> FinishTestAsync(FinishTestDto dto);
        Task SendResultEmailAsync(EmailRequest request);
        Task<List<Test>> SearchTestsAsync(string searchTerm);
        Task<List<HonorBoardEntry>> GetHonorBoardAsync(string testId);

    }
}