using Enroll.Models;
using System.Security.Claims;

public interface ICategoryServices
{
    Task<List<Category>> GetAsync();
    Task<Category?> GetAsync(string id);
    Task CreateAsync(Category newCategory);
    Task UpdateAsync(string id, Category updatedCategory);
    Task RemoveAsync(string id);

    Task<(bool Success, string? ErrorMessage)> TryCreateCategoryAsync(Category category, ClaimsPrincipal user);
    Task<(bool IsAllowed, List<Category>? Categories)> TryGetCategoriesAsync(ClaimsPrincipal user);
}
