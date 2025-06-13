using Enroll.Models;

namespace Enroll.Interfaces;

public interface IUniversityReaderService
{
    Task<IEnumerable<University>> GetAllAsync();
    Task<University?> GetByIdAsync(string id);
}
