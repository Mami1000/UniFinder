namespace Enroll.Interfaces
{
    public class FileSystemRepository : IFileRepository
    {
        public async Task SaveFileAsync(string filePath, byte[] content)
        {
            await File.WriteAllBytesAsync(filePath, content);
        }

        public async Task DeleteFileAsync(string filePath)
        {
            if (File.Exists(filePath))
            {
                File.Delete(filePath);
            }
            await Task.CompletedTask;
        }

        public bool FileExists(string filePath)
        {
            return File.Exists(filePath);
        }
    }
}