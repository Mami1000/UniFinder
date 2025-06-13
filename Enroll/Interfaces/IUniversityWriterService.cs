using Enroll.Models;

namespace Enroll.Interfaces;

public interface IUniversityWriterService
{
    Task<University> CreateAsync(University university);
    Task UpdateAsync(University university);
}
