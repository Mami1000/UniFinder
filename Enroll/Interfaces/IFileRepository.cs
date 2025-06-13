namespace Enroll.Interfaces
{
    public interface IFileRepository
    {
        Task SaveFileAsync(string filePath, byte[] content);
        Task DeleteFileAsync(string filePath);
        bool FileExists(string filePath);
    }

}