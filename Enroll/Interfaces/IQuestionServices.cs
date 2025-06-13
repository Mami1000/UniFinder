using Enroll.Models;

namespace Enroll.Services
{
    //Интерфейс для работы с вопросами
      public interface IQuestionServices
    {
        Task<List<Question>> GetAsync();
        Task<Question?> GetAsync(string id);
        Task<List<Question>> GetQuestionsByIdsAsync(List<string> ids);

        Task<List<Question>> GetQuestionsByCategoryAsync(string categoryId);
        Task<Question?> GetQuestionWithCategoryAsync(string id);
        Task<List<object>> GetQuestionsByCategoryWithNamesAsync(string categoryId);
        Task<(int StatusCode, object Response)> CreateQuestionAsync(Question model, IFormFile? imageFile);
        Task<List<object>> GetAllQuestionsWithCategoriesAsync();
        Task<(int StatusCode, object Response)> CreateBulkQuestionsAsync(BulkQuestionModel model);
        Task<(int StatusCode, object Response)> RemoveQuestionAsync(string id);
        Task<(int StatusCode, object Response)> UpdateQuestionAsync(string id, Question updated, IFormFile? imageFile, string? imageUrl = null);
        Task<(bool Success, int StatusCode, object Response)> DeleteQuestionImageAsync(string id);

        
        
    }
}
