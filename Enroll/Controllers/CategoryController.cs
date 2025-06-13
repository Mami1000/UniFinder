using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Enroll.Models;
using Enroll.Services;
using System.Threading.Tasks;
using System.Security.Claims;

namespace Enroll.Controllers
{
    [ApiController]
    [Route("api/category")]
    public class CategoryController : ControllerBase
    {
        private readonly ICategoryServices _categoryServices;
        private readonly IQuestionServices _questionServices;

        public CategoryController(
            ICategoryServices categoryServices, 
            IQuestionServices questionServices)
        {
            _categoryServices = categoryServices;
            _questionServices = questionServices;
        }

        [Authorize(Roles = "admin")]
        [HttpPost("create")]
        public async Task<IActionResult> CreateCategory([FromBody] Category category)
        {
            var (success, error) = await _categoryServices.TryCreateCategoryAsync(category, User);
            if (!success)
            {
                return error switch
                {
                    "Unauthorized" => Unauthorized(),
                    "Forbidden" => Forbid(),
                    _ => BadRequest(new { Message = error })
                };
            }

            return Ok(category);
        }

       [Authorize] 
        [HttpGet("list")]
        public async Task<IActionResult> GetCategories()
        {
            var categories = await _categoryServices.GetAsync();
            return Ok(categories);
        }

        [Authorize] 
        [HttpGet("{id:length(24)}/questions")]
        public async Task<IActionResult> GetQuestionsByCategory(string id)
        {
            var category = await _categoryServices.GetAsync(id);
            if (category == null)
                return NotFound(new { Message = "Категория не найдена" });

            var questions = await _questionServices.GetQuestionsByCategoryWithNamesAsync(id);

            return Ok(new
            {
                category.Id,
                category.Name,
                Questions = questions
            });
        }

    }
}
