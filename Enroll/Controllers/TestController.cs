using Enroll.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Enroll.Models;
using Enroll.DTOs;
using MongoDB.Bson;

namespace Enroll.Controllers
{
    [ApiController]
    [Route("api/test")]
    public class TestController : ControllerBase
    {
        private readonly ITestService _testsService;
        public TestController(ITestService testsService)
        {
            _testsService = testsService;
        }

        [HttpPost("sendMessage")]
        public async Task<IActionResult> SendMessage([FromBody] EmailRequest request)
        {
            try
            {
                // Здесь вызываем метод в тестовом сервисе, который обрабатывает отправку
                await _testsService.SendResultEmailAsync(request);
                return Ok(new { message = "Email sent successfully" });
            }
            catch (Exception ex)
            {
                // Можно дополнительно логировать ошибку
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // Метод для поиска всех тестов
        [HttpGet("search")]
        public async Task<IActionResult> SearchTests([FromQuery] string term)
        {
            var tests = await _testsService.SearchTestsAsync(term);
            return Ok(tests);
        }


        [HttpOptions("sendMessage")]
        [AllowAnonymous]
        public IActionResult SendMessageOptions()
        {
            return Ok();
        }

        [Authorize(Roles = "admin")]
        [HttpPost("create")]
        public async Task<IActionResult> CreateTest([FromBody] CreateTestDto newTestDto)
        {
            if (newTestDto == null)
                return BadRequest(new { message = "Данные теста не переданы" });

            var result = await _testsService.CreateTestAsync(newTestDto);
            return StatusCode(result.StatusCode, result.Response);
        }

        [HttpGet("{id:length(24)}", Name = "GetTestById")]
        public async Task<IActionResult> GetTestById(string id)
        {
            if (string.IsNullOrEmpty(id) || !ObjectId.TryParse(id, out _))
                return BadRequest(new { message = "Некорректный формат Id теста" });

            var result = await _testsService.GetTestByIdAsync(id);
            return StatusCode(result.StatusCode, result.Response);
        }


        [HttpGet("list")]
        public async Task<IActionResult> ListTests()
        {
            var result = await _testsService.GetAllTestsAsync();
            return StatusCode(result.StatusCode, result.Response);
        }

        [Authorize(Roles = "admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTest(string id, [FromBody] Test updatedTest)
        {
            if (string.IsNullOrEmpty(id) || updatedTest == null)
                return BadRequest(new { message = "Некорректные данные для обновления" });

            var result = await _testsService.UpdateTestAsync(id, updatedTest);
            return StatusCode(result.StatusCode, result.Response);
        }

        [Authorize(Roles = "admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTest(string id)
        {
            if (string.IsNullOrEmpty(id))
                return BadRequest(new { message = "Некорректный Id теста" });

            var result = await _testsService.DeleteTestAsync(id);
            return StatusCode(result.StatusCode, result.Response);
        }

        [HttpGet("generate-questions/{id}")]
        public async Task<IActionResult> GenerateQuestionsForTest(string id)
        {
            if (string.IsNullOrEmpty(id))
                return BadRequest(new { message = "Некорректный Id теста" });

            var result = await _testsService.GenerateQuestionsForTestAsync(id);
            return StatusCode(result.StatusCode, result.Response);
        }

        //Метод создания кода для теста
        [HttpGet("CreateCodeForTest/{id}")]
        public async Task<IActionResult> CreateCodeForTest(string id, [FromQuery] string userId)
        {
            if (string.IsNullOrEmpty(id))
                return BadRequest(new { message = "Некорректный Id теста" });

            if (string.IsNullOrEmpty(userId))
                return BadRequest(new { message = "Некорректный Id пользователя" });

            var result = await _testsService.CreateCodeForTestAsync(id, userId);
            return StatusCode(result.StatusCode, result.Response);
        }
        //Метод открытия теста
        [HttpGet("open")]
        public async Task<IActionResult> OpenTest([FromQuery] string key, [FromQuery] string testId)
        {
            if (string.IsNullOrEmpty(key) || string.IsNullOrEmpty(testId))
                return BadRequest(new { message = "Ключ теста и Id теста обязательны" });

            var result = await _testsService.OpenTestAsync(key, testId);
            return StatusCode(result.StatusCode, result.Response);
        }
        //Метод завершения теста...
        [HttpPost("finish")]
        public async Task<IActionResult> FinishTest([FromBody] FinishTestDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Делегируем логику сервису
            var result = await _testsService.FinishTestAsync(dto);
            return StatusCode(result.StatusCode, result.Response);
        }
        //Метод для получения доски почета абитуриентов
        [HttpGet("honorboard/{testId}")]
        public async Task<IActionResult> GetHonorBoard(string testId)
        {
            var topResults = await _testsService.GetHonorBoardAsync(testId);
            return Ok(topResults);
        }

    }
}
