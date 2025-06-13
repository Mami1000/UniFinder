using System.Security.Cryptography;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Enroll.Interfaces;
using Enroll.Models;

namespace Enroll.Services
{
    public class MediaService : IMediaService
{
        // private readonly IFileRepository _fileRepository;
        // private readonly string _attachmentsPath;

        // public MediaService(
        //      IEncryptionService encryptionService,
        //      IFileRepository fileRepository,
        //      IFileHashRepository fileHashRepository,
        //      IConfiguration configuration)
        // {
        //      _encryptionService = encryptionService;
        //      _fileRepository = fileRepository;
        //      _fileHashRepository = fileHashRepository;
        //      _attachmentsPath = Path.Combine(Directory.GetCurrentDirectory(), "attachments");
        //      Directory.CreateDirectory(_attachmentsPath);
        // }
        private readonly IFileHashRepository _fileHashRepository;
    
        private readonly IEncryptionService _encryptionService;
        private readonly BlobContainerClient _containerClient;

        public MediaService(
            IEncryptionService encryptionService,
            IFileHashRepository fileHashRepository,
            BlobServiceClient blobServiceClient,
            IConfiguration configuration)
        {
            _encryptionService = encryptionService;
            _fileHashRepository = fileHashRepository;

            var containerName = configuration["AzureBlobStorage:ContainerName"];
            _containerClient = blobServiceClient.GetBlobContainerClient(containerName);
            _containerClient.CreateIfNotExists(PublicAccessType.None);
        }

 public async Task<string> UploadUserPhotoAsync(IFormFile file, string userId)
{
    if (file == null || file.Length == 0)
        throw new ArgumentException("Файл отсутствует или имеет нулевую длину.", nameof(file));

    byte[] fileBytes;
    using (var ms = new MemoryStream())
    {
        await file.CopyToAsync(ms);
        fileBytes = ms.ToArray();
    }

    // Вычисляем SHA256
    string fileHash;
    using (var sha256 = SHA256.Create())
    {
        var hashBytes = sha256.ComputeHash(fileBytes);
        fileHash = BitConverter.ToString(hashBytes).Replace("-", "").ToLowerInvariant();
    }

    var existingRecord = await _fileHashRepository.GetByUserIdAsync(userId);
    if (existingRecord != null)
    {
        if (existingRecord.FileHash == fileHash)
            return existingRecord.FileName!;

        // Удаляем старый blob
        if (!string.IsNullOrEmpty(existingRecord.FileName))
        {
            var oldBlob = _containerClient.GetBlobClient(existingRecord.FileName);
            await oldBlob.DeleteIfExistsAsync();
        }

        await _fileHashRepository.DeleteRecordByUserIdAsync(userId);
    }

    // Шифруем
    byte[] iv;
    var encryptedBytes = _encryptionService.Encrypt(fileBytes, out iv);

    // НЕ объединяем iv вручную, encryptedBytes уже содержит IV + ciphertext + tag
    var uniqueFileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
    var blobClient = _containerClient.GetBlobClient(uniqueFileName);

    using (var ms = new MemoryStream(encryptedBytes))
    {
        await blobClient.UploadAsync(ms, overwrite: true);
    }

    // Запись в БД
    var newRecord = new FileHashRecord
    {
        UserId = userId,
        FileHash = fileHash,
        FileName = uniqueFileName,
        UploadedAt = DateTime.UtcNow
    };
    await _fileHashRepository.InsertRecordAsync(newRecord);

    return uniqueFileName;
}

public async Task<string> UploadQuestionImageAsync(IFormFile file)
{
    if (file == null || file.Length == 0)
        throw new ArgumentException("Файл отсутствует или имеет нулевую длину.", nameof(file));

    byte[] fileBytes;
    using (var ms = new MemoryStream())
    {
        await file.CopyToAsync(ms);
        fileBytes = ms.ToArray();
    }

    byte[] iv;
    var encryptedBytes = _encryptionService.Encrypt(fileBytes, out iv);

    var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
    var blobClient = _containerClient.GetBlobClient(fileName);

    using (var stream = new MemoryStream(encryptedBytes))
    {
        await blobClient.UploadAsync(stream, overwrite: true);
    }

    return fileName;
}

public async Task<string> UploadUniversityLogoAsync(IFormFile file)
{
    byte[] fileBytes;
    using (var ms = new MemoryStream())
    {
        await file.CopyToAsync(ms);
        fileBytes = ms.ToArray();
    }

    byte[] iv;
    var encryptedBytes = _encryptionService.Encrypt(fileBytes, out iv);

    var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
    var blobClient = _containerClient.GetBlobClient(fileName);

    using (var stream = new MemoryStream(encryptedBytes))
    {
        await blobClient.UploadAsync(stream, overwrite: true);
    }

    return fileName;
}


    public async Task<byte[]> DecryptPhotoAsync(string fileName)
    {
        var blobClient = _containerClient.GetBlobClient(fileName);

        if (!await blobClient.ExistsAsync())
            throw new FileNotFoundException("Файл не найден", fileName);

        var download = await blobClient.OpenReadAsync();
        using var ms = new MemoryStream();
        await download.CopyToAsync(ms);

        var combinedBytes = ms.ToArray();

        return _encryptionService.Decrypt(combinedBytes); 
    }
  }
}