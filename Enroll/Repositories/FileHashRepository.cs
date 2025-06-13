using Enroll.Interfaces;
using Enroll.Models;
using MongoDB.Driver;
namespace Enroll.Repositories
{
public class FileHashRepository : IFileHashRepository
{
        private readonly IMongoCollection<FileHashRecord> _collection;

        public FileHashRepository(IMongoDatabase database)
        {
            _collection = database.GetCollection<FileHashRecord>("FileHashes");
        }

        public async Task<FileHashRecord> GetByUserIdAsync(string userId)
        {
            return await _collection.Find(x => x.UserId == userId).FirstOrDefaultAsync();
        }

        public async Task<FileHashRecord> GetByHashAsync(string fileHash)
        {
            return await _collection.Find(x => x.FileHash == fileHash).FirstOrDefaultAsync();
        }

        public async Task InsertRecordAsync(FileHashRecord record)
        {
            await _collection.InsertOneAsync(record);
        }

        public async Task DeleteRecordByUserIdAsync(string userId)
        {
            await _collection.DeleteOneAsync(x => x.UserId == userId);
        }
    }
}