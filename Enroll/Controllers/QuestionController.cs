using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Enroll.Models;
using Enroll.Services;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace Enroll.Controllers
{
    [ApiController]
    [Route("api/question")]
    public class QuestionsController : ControllerBase
    {
        private readonly IQuestionServices _questionServices;

        public QuestionsController(IQuestionServices questionServices)
        {
            _questionServices = questionServices;
        }

        /// <summary>
        /// Получение информации о вопросе по ID.
        /// </summary>
        [HttpGet("details/{id:length(24)}")]
        public async Task<IActionResult> GetDetails(string id)
        {
            var question = await _questionServices.GetQuestionWithCategoryAsync(id);
            if (question == null)
                return NotFound(new { Message = "Вопрос не найден" });

            return Ok(question);
        }

        [HttpPost("getquestions")]
        [AllowAnonymous]
        public async Task<IActionResult> GetQuestions([FromBody] dynamic data)
        {
            string id = data?.id ?? string.Empty;
            if (string.IsNullOrEmpty(id) || id.Length != 24)
                return BadRequest(new { Message = "Некорректный идентификатор" });

            var questions = await _questionServices.GetQuestionsByCategoryWithNamesAsync(id);
            if (questions == null || questions.Count == 0)
                return NotFound(new { Message = "Вопросы не найдены" });

            return Ok(questions);
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateQuestion([FromForm] Question model, IFormFile? image)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _questionServices.CreateQuestionAsync(model, image);
            return StatusCode(result.StatusCode, result.Response);
        }


        [Authorize(Roles = "admin")]
        [HttpPost("bulk-create")]
        public async Task<IActionResult> CreateBulkQuestion([FromBody] BulkQuestionModel model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _questionServices.CreateBulkQuestionsAsync(model);
            return StatusCode(result.StatusCode, result.Response);
        }

        [HttpGet("list")]
        public async Task<IActionResult> GetAllQuestions()
        {
            var questions = await _questionServices.GetAllQuestionsWithCategoriesAsync();
            return Ok(questions);
        }

        [HttpDelete("{id:length(24)}")]
        public async Task<IActionResult> RemoveQuestion(string id)
        {
            var result = await _questionServices.RemoveQuestionAsync(id);
            return StatusCode(result.StatusCode, result.Response);
        }

    [HttpPut("update/{id:length(24)}")]
    public async Task<IActionResult> UpdateQuestion(string id, [FromForm] Dictionary<string, string> form, IFormFile? image)
    {
        if (!form.TryGetValue("text", out var text) ||
            !form.TryGetValue("answer", out var answer) ||
            !form.TryGetValue("categoryId", out var categoryId) ||
            !form.TryGetValue("point", out var pointStr))
        {
            return BadRequest("Не все поля заданы.");
        }

        int.TryParse(pointStr, out int point);

        var updatedQuestion = new Question
        {
            Text = text,
            Answer = answer,
            CategoryId = categoryId,
            Note = form.TryGetValue("note", out var note) ? note : "",
            Point = point
        };

        form.TryGetValue("imageUrl", out var imageUrl); // 👈 если изображение уже загружено, без файла

        var result = await _questionServices.UpdateQuestionAsync(id, updatedQuestion, image, imageUrl);

        return StatusCode(result.StatusCode, result.Response); // result.Response будет просто Question
    }


    [HttpDelete("delete-image/{id:length(24)}")]
        public async Task<IActionResult> DeleteQuestionImage(string id)
        {
            var question = await _questionServices.GetQuestionWithCategoryAsync(id);
            if (question == null)
                return NotFound(new { Message = "Вопрос не найден" });

            // Удаляем изображение из записи
            var result = await _questionServices.DeleteQuestionImageAsync(id);
            if (!result.Success)
                return StatusCode(result.StatusCode, result.Response);

            return Ok(new { Message = "Изображение удалено" });
        }
    }
}
