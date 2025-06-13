using MongoDB.Bson;
using MongoDB.Driver;
using Microsoft.Extensions.Configuration;
using Enroll.Models;
using Enroll.Interfaces;
using System.Security.Claims;

namespace Enroll.Services
{
    public class CategoryServices : ICategoryServices
    {
        private readonly IMongoCollection<Category> _categories;
        private readonly IUserQueryService _userQueryService;

        public CategoryServices(IConfiguration config, IUserQueryService userQueryService)
        {
            var client = new MongoClient(config.GetConnectionString("Project20Database"));
            var database = client.GetDatabase("Project20Database");
            _categories = database.GetCollection<Category>("Categories");
            _userQueryService = userQueryService;
        }

        public async Task<List<Category>> GetAsync() =>
            await _categories.Find(_ => true).ToListAsync();

        public async Task<Category?> GetAsync(string id)
        {
            if (string.IsNullOrEmpty(id) || !ObjectId.TryParse(id, out _))
                return null;

            return await _categories.Find(x => x.Id == id).FirstOrDefaultAsync();
        }

        public async Task CreateAsync(Category newCategory) =>
            await _categories.InsertOneAsync(newCategory);

        public async Task UpdateAsync(string id, Category updatedCategory) =>
            await _categories.ReplaceOneAsync(x => x.Id == id, updatedCategory);

        public async Task RemoveAsync(string id) =>
            await _categories.DeleteOneAsync(x => x.Id == id);

        public async Task<(bool Success, string? ErrorMessage)> TryCreateCategoryAsync(Category category, ClaimsPrincipal user)
        {
            var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return (false, "Unauthorized");

            if (!await _userQueryService.IsUserAdmin(userId))
                return (false, "Forbidden");

            if (category == null)
                return (false, "Данные категории не переданы");

            await CreateAsync(category);
            return (true, null);
        }

        public async Task<(bool IsAllowed, List<Category>? Categories)> TryGetCategoriesAsync(ClaimsPrincipal user)
        {
            var userName = user?.Identity?.Name;
            if (string.IsNullOrEmpty(userName))
                return (false, null);

            var userId = user != null ? user.FindFirstValue(ClaimTypes.NameIdentifier) : null;
            if (string.IsNullOrEmpty(userId) || !await _userQueryService.IsUserAdmin(userId))
                return (false, null);
            var categories = await GetAsync();
            return (true, categories);
        }
        public async Task<(bool Exists, string? Name)> CheckCategoryExistsWithNameAsync(string categoryId)
        {
            if (string.IsNullOrEmpty(categoryId) || !ObjectId.TryParse(categoryId, out _))
                return (false, null);

            var category = await GetAsync(categoryId);
            return (category != null, category?.Name);
        }

    }
}
