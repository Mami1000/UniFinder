using Enroll.Models;
using Enroll.Interfaces;
using MongoDB.Driver;

namespace Enroll.Services;

public class ProfessionService : IProfessionService
{
    private readonly IMongoCollection<Profession> _collection;

    public ProfessionService(IMongoDatabase database)
    {
        _collection = database.GetCollection<Profession>("Professions");
    }

    public async Task<List<Profession>> GetAllAsync() =>
        await _collection.Find(_ => true).ToListAsync();

    public async Task<Profession?> GetByIdAsync(string id) =>
        await _collection.Find(p => p.Id == id).FirstOrDefaultAsync();

    public async Task CreateAsync(Profession profession) =>
        await _collection.InsertOneAsync(profession);

    public async Task UpdateAsync(string id, Profession profession) =>
        await _collection.ReplaceOneAsync(p => p.Id == id, profession);

    public async Task DeleteAsync(string id) =>
        await _collection.DeleteOneAsync(p => p.Id == id);

    public async Task BulkCreateAsync(List<Profession> professions)
    {
        if (professions == null || professions.Count == 0)
            return;

        await _collection.InsertManyAsync(professions);
    }


}
