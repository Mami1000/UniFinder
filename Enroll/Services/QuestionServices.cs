using Enroll.Interfaces;
using Enroll.Models;
using MongoDB.Bson;
using MongoDB.Driver;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Enroll.Services
{
    public class QuestionServices : IQuestionServices
{
    private readonly IMongoCollection<Question> _questions;
    private readonly ICategoryServices _categoryService;
    private readonly IMediaService _mediaService;

        public QuestionServices(IMongoDbContext context, ICategoryServices categoryService, IMediaService mediaService)
        {
            _questions = context.Questions;
            _categoryService = categoryService;
            _mediaService = mediaService;
        }

        public async Task<List<Question>> GetAsync() =>
            await _questions.Find(_ => true).ToListAsync();

        // Получение вопроса по ID для одного вопроса
        public async Task<Question?> GetAsync(string id) =>
            await _questions.Find(q => q.Id == id).FirstOrDefaultAsync();

        // Получение вопроса по ID для нескольких вопросов
        public async Task<List<Question>> GetQuestionsByIdsAsync(List<string> ids)
        {
            var filter = Builders<Question>.Filter.In(q => q.Id, ids);
            return await _questions.Find(filter).ToListAsync();
        }    

        public async Task<List<Question>> GetQuestionsByCategoryAsync(string categoryId) =>
            await _questions.Find(q => q.CategoryId == categoryId).ToListAsync();

        public async Task<Question?> GetQuestionWithCategoryAsync(string id)
        {
            var question = await GetAsync(id);
            if (question == null) return null;

            var category = await _categoryService.GetAsync(question.CategoryId);
            return new Question
            {
                Id = question.Id,
                Text = question.Text,
                Answer = question.Answer,
                Note = question.Note,
                CategoryId = question.CategoryId,
                Point = question.Point,
                CategoryName = category?.Name ?? "Неизвестная категория"
            };
        }
        public async Task<List<object>> GetQuestionsByCategoryWithNamesAsync(string categoryId)
        {
            var questions = await GetQuestionsByCategoryAsync(categoryId);
            var category = await _categoryService.GetAsync(categoryId);
            var categoryName = category?.Name ?? "Неизвестная категория";

        return questions.Select(q => (object)new
        {
            q.Id,
            q.Text,
            q.Answer,
            q.Note,
            CategoryId = q.CategoryId,
            CategoryName = categoryName,
            q.Point,
            q.ImageUrl 
        }).ToList();
        }

  public async Task<(int StatusCode, object Response)> CreateQuestionAsync(Question model, IFormFile? imageFile)
{
    // Проверяем существование категории
    var category = await _categoryService.GetAsync(model.CategoryId);
    if (category == null)
        return (404, new { Message = "Категория не найдена" });

    // Преобразуем note
    model.Note = model.Note != "-" ? model.Note : string.Empty;

    // Проверяем формат CategoryId
    if (!ObjectId.TryParse(model.CategoryId, out var categoryIdObj))
        return (400, new { Message = "Неверный формат CategoryId" });

    model.CategoryId = categoryIdObj.ToString();

    // Загружаем изображение в Azure Blob, если есть
    if (imageFile != null)
    {
        try
        {
            var imageFileName = await _mediaService.UploadQuestionImageAsync(imageFile);
            model.ImageUrl = imageFileName; // сохраняем имя, без "/images/"
        }
        catch (Exception ex)
        {
            return (500, new { Message = "Ошибка при загрузке изображения", Details = ex.Message });
        }
    }

    // Сохраняем в MongoDB
    await _questions.InsertOneAsync(model);

    return (201, new { Message = "Вопрос создан", Question = model });
}


        public async Task<(int StatusCode, object Response)> CreateBulkQuestionsAsync(BulkQuestionModel model)
        {
            if (model.Questions == null || !model.Questions.Any())
            {
                return (400, new { Message = "Не предоставлено ни одного вопроса." });
            }
            foreach (var question in model.Questions)
            {
                var category = await _categoryService.GetAsync(question.CategoryId);
                if (category == null)
                {
                    return (404, new { Message = $"Категория с ID {question.CategoryId} не найдена" });
                }
                // Обработка заметки, если требуется.
                question.Note = question.Note != "-" ? question.Note : string.Empty;
            }

            await _questions.InsertManyAsync(model.Questions);
            var createdQuestions = model.Questions.Select(q => new 
            {
                q.Id,
                q.Text,
                q.Answer,
                q.Note,
                q.CategoryId,
                q.Point,
                q.ImageUrl
            }).ToList();

            return (201, new { Message = "Вопросы созданы", Count = model.Questions.Count, Questions = createdQuestions });
        }

        public async Task<List<object>> GetAllQuestionsWithCategoriesAsync()
        {
            var questions = await GetAsync();
            var categories = new Dictionary<string, string>();

            var result = new List<object>();
            foreach (var q in questions)
            {
                if (!categories.ContainsKey(q.CategoryId))
                {
                    var category = await _categoryService.GetAsync(q.CategoryId);
                    categories[q.CategoryId] = category?.Name ?? "Неизвестная категория";
                }

                result.Add(new
                {
                    q.Id,
                    q.Text,
                    q.Answer,
                    q.Note,
                    CategoryId = q.CategoryId,
                    CategoryName = categories[q.CategoryId],
                    q.Point
                });
            }
            return result;
        }

        public async Task<(int StatusCode, object Response)> RemoveQuestionAsync(string id)
        {
            var result = await _questions.DeleteOneAsync(q => q.Id == id);
            if (result.DeletedCount == 0)
                return (404, new { Message = "Вопрос не найден" });

            return (200, new { Message = "Вопрос удалён" });
        }

        public async Task<(int StatusCode, object Response)> UpdateQuestionAsync(
        string id, Question updated, IFormFile? imageFile, string? imageUrl = null)
        {
            var existing = await _questions.Find(q => q.Id == id).FirstOrDefaultAsync();
            if (existing == null)
                return (404, new { Message = "Вопрос не найден" });

            var category = await _categoryService.GetAsync(updated.CategoryId);
            if (category == null)
                return (404, new { Message = "Категория не найдена" });

            existing.Text = updated.Text;
            existing.Answer = updated.Answer;
            existing.Note = updated.Note != "-" ? updated.Note : string.Empty;
            existing.CategoryId = updated.CategoryId;
            existing.Point = updated.Point;

            if (imageFile != null)
            {
                var newFileName = await _mediaService.UploadQuestionImageAsync(imageFile);
                existing.ImageUrl = newFileName;
            }
            else if (!string.IsNullOrEmpty(imageUrl))
            {
                existing.ImageUrl = imageUrl; 
            }

            await _questions.ReplaceOneAsync(q => q.Id == id, existing);
            return (200, new { message = "Вопрос обновлён", question = existing });
        }



        public async Task<(bool Success, int StatusCode, object Response)> DeleteQuestionImageAsync(string id)
        {
            var question = await _questions.Find(q => q.Id == id).FirstOrDefaultAsync();
            if (question == null)
                return (false, 404, new { Message = "Вопрос не найден" });

            if (string.IsNullOrEmpty(question.ImageUrl))
                return (false, 400, new { Message = "У вопроса нет изображения для удаления" });

            try
            {
                // Формируем путь к файлу на сервере
                var imagePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", question.ImageUrl.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));

                if (File.Exists(imagePath))
                {
                    File.Delete(imagePath);
                }

                // Обнуляем ссылку на изображение в базе
                question.ImageUrl = null;

                await _questions.ReplaceOneAsync(q => q.Id == id, question);

                return (true, 200, new { Message = "Изображение удалено" });
            }
            catch (Exception ex)
            {
                return (false, 500, new { Message = "Ошибка при удалении изображения", Details = ex.Message });
            }
        }
    }
}
