namespace Enroll.Interfaces
{
    public interface IMediaService
    {
        Task<string> UploadUserPhotoAsync(IFormFile file, string userId);
        Task<string> UploadUniversityLogoAsync(IFormFile file);
        Task<byte[]> DecryptPhotoAsync(string fileName);
        Task<string> UploadQuestionImageAsync(IFormFile file);
    }

}