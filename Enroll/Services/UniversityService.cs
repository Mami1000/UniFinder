using Enroll.Interfaces;
using Enroll.Models;
using MongoDB.Driver;

namespace Enroll.Services;

public class UniversityService : IUniversityReaderService, IUniversityWriterService
{
     private readonly IMongoCollection<University> _universities;

    public UniversityService(IMongoDbContext context)
    {
        _universities = context.Universities;
    }

    public async Task<IEnumerable<University>> GetAllAsync()
    {
        return await _universities.Find(_ => true).ToListAsync();
    }

    public async Task<University?> GetByIdAsync(string id)
    {
        return await _universities.Find(u => u.Id == id).FirstOrDefaultAsync();
    }

    public async Task<University> CreateAsync(University university)
    {
        university.Id = Guid.NewGuid().ToString();
        await _universities.InsertOneAsync(university);
        return university;
    }

    public async Task UpdateAsync(University university)
    {
        await _universities.ReplaceOneAsync(u => u.Id == university.Id, university);
    }
}
