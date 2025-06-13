using System.Threading.Tasks;

namespace Enroll.Services
{
    public interface ITranslationService
    {
        Task<string> TranslateAsync(string text, string sourceLanguage, string targetLanguage);
    }
}
