using Enroll.Models;

namespace Enroll.Interfaces
{
public interface IFileHashRepository
{
    Task<FileHashRecord> GetByUserIdAsync(string userId);
    Task<FileHashRecord> GetByHashAsync(string fileHash);
    Task InsertRecordAsync(FileHashRecord record);
    Task DeleteRecordByUserIdAsync(string userId);
}

}