using Enroll.DTOs;
using Enroll.Interfaces;
using Enroll.Models;
using MongoDB.Driver;
namespace Enroll.Services
{
    public class RecommendationService : IRecommendationService
    {
        private readonly IMongoCollection<Profession> _professions;
        private readonly IMongoCollection<University> _universities;

        private readonly IMongoCollection<UserProfile> _userProfiles;

        public RecommendationService(IMongoDbContext context)
        {
            _professions = context.Professions;
            _universities = context.Universities;
            _userProfiles = context.UserProfiles; 
        }

        public async Task<RecommendationFullResult> GetRecommendationsAsync(int score, string userId)
        {
            var allProfessions = await _professions.Find(_ => true).ToListAsync();

            // 🔹 Загружаем профиль пользователя
            var userProfile = await _userProfiles.Find(p => p.UserId == userId).FirstOrDefaultAsync();
            var userStrengths = userProfile?.CategoryScores
                .Where(cs => cs.Accuracy >= 0.7) // Порог "сильной" стороны
                .Select(cs => cs.Category)
                .ToHashSet() ?? new HashSet<string>();

            // 🔹 Фильтруем по баллам
            var scoredProfessions = allProfessions
                .Where(p => p.MinScore <= score)
                .Select(p => new
                {
                    Profession = p,
                    Relevance = 1 - ((score - p.MinScore) / (double)score), // Балловая релевантность
                    CategoryMatch = p.RelatedCategories != null && p.RelatedCategories.Any(c => userStrengths.Contains(c)) ? 1 : 0
                })
                .OrderByDescending(x => x.CategoryMatch) // Сначала те, что совпадают по категориям
                .ThenByDescending(x => x.Relevance) // Потом по баллу
                .Take(3)
                .ToList();

            // 🔹 Университеты
            var universityIds = scoredProfessions.Select(x => x.Profession.UniversityId).Distinct().ToList();

            var universities = await _universities
                .Find(u => universityIds.Contains(u.Id))
                .ToListAsync();

            var universityMap = universities.ToDictionary(u => u.Id, u => u);

            var grouped = scoredProfessions
                .GroupBy(x => x.Profession.UniversityId)
                .Select(g =>
                {
                    var uni = universityMap.GetValueOrDefault(g.Key);

                    return new RecommendationResult
                    {
                        University = uni?.Name ?? "Неизвестный ВУЗ",
                        Location = uni?.Location ?? "-",
                        LogoUrl = uni?.LogoUrl,
                        Description = uni?.Description,
                        Programs = g.Select(x => new RecommendationProgramDto
                        {
                            Name = x.Profession.Name,
                            Faculty = x.Profession.Faculty,
                            Type = x.Profession.Type,
                            MinScore = x.Profession.MinScore
                        }).ToList()
                    };
                }).ToList();

            // 🔸 Если ничего не подошло
            if (!grouped.Any())
            {
                var closestProfession = allProfessions
                    .Where(p => p.MinScore > score)
                    .OrderBy(p => p.MinScore)
                    .FirstOrDefault();

                University? closestUni = null;

                if (closestProfession != null)
                {
                    closestUni = await _universities
                        .Find(u => u.Id == closestProfession.UniversityId)
                        .FirstOrDefaultAsync();
                }

                return new RecommendationFullResult
                {
                    Recommendations = new List<RecommendationResult>(),
                    ClosestProfession = closestProfession != null ? new ClosestProfessionDto
                    {
                        Name = closestProfession.Name,
                        Faculty = closestProfession.Faculty,
                        Type = closestProfession.Type,
                        MinScore = closestProfession.MinScore,
                        University = closestUni?.Name ?? "Неизвестный ВУЗ",
                        Location = closestUni?.Location ?? "-",
                        LogoUrl = closestUni?.LogoUrl
                    } : null,
                    NeededPoints = closestProfession != null ? (int)(closestProfession.MinScore - score) : 0
                };
            }

            return new RecommendationFullResult
            {
                Recommendations = grouped,
                ClosestProfession = null,
                NeededPoints = 0
            };
        }

    }
}