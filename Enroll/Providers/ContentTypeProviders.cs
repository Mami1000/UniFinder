using Enroll.Interfaces;

namespace Enroll.Providers
{
    public class ContentTypeProvider : IContentTypeProvider
    {
    // Словарь для хранения соответствий расширений файлов и MIME-типов
    private static readonly Dictionary<string, string> _mimeTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        { ".jpg", "image/jpeg" },
        { ".jpeg", "image/jpeg" },
        { ".png", "image/png" },
        { ".gif", "image/gif" },
        { ".bmp", "image/bmp" },
        { ".webp", "image/webp" },
        { ".svg", "image/svg+xml" },  
        { ".ico", "image/x-icon" }  
    };


    public string GetContentType(string fileName)
    {
        var extension = Path.GetExtension(fileName);
        if (extension != null && _mimeTypes.TryGetValue(extension, out var contentType))
        {
            return contentType;
        }

        return "application/octet-stream"; 
    }

    public bool IsSupportedContentType(string contentType)
    {
        return _mimeTypes.Values.Contains(contentType, StringComparer.OrdinalIgnoreCase);   
    }

    public bool IsAllowedImageType(string contentType)
    {
        // Проверяем, является ли переданный MIME-тип допустимым для изображений
        return contentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase) && IsSupportedContentType(contentType);
    }
  }
}