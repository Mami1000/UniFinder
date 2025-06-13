using Enroll.Models;

namespace Enroll.Interfaces;

public interface IProfessionService
{
    Task<List<Profession>> GetAllAsync();
    Task<Profession?> GetByIdAsync(string id);
    Task CreateAsync(Profession profession);
    Task BulkCreateAsync(List<Profession> professions);

    Task UpdateAsync(string id, Profession profession);
    Task DeleteAsync(string id);
}
