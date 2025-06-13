namespace Enroll.Interfaces
{
    public interface IContentTypeProvider
    {
        string GetContentType(string fileName);
        bool IsSupportedContentType(string contentType);
        bool IsAllowedImageType(string contentType); // Метод для проверки допустимых типов изображений

    }
}