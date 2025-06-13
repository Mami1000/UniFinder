using Enroll.DTOs;

namespace Enroll.Interfaces
{
    public interface IRecommendationService
    {
        Task<RecommendationFullResult> GetRecommendationsAsync(int score, string userId);
    }
}
