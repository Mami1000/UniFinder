using Enroll.Models;
using MongoDB.Driver;
using Enroll.DTOs;
using MongoDB.Bson;
using Enroll.Interfaces;
namespace Enroll.Services
{
    public class TestService : ITestService
    {
        private readonly IMongoCollection<Test> _tests;
        private readonly IMongoCollection<TestSession> _testSessions;
        private readonly IMongoCollection<UserKeyUsage> _userKeyUsageCollection;
        private readonly ICategoryServices _categoryServices;
        private readonly IQuestionServices _questionServices;
        private readonly IUserQueryService _userQueryService;
        private readonly IUserCommandService __userCommandService;
        private readonly IEmailService _emailService;
        private readonly IRecommendationService _recommendationService;
        private readonly IMongoCollection<UserProfile> _userProfiles;
        private static Dictionary<string, string> _generatedTestCodes = new();

        public TestService(
            IMongoDbContext context,
            ICategoryServices categoryServices,
            IQuestionServices questionServices,
            IEmailService emailService,
            IUserQueryService userQueryService,
            IUserCommandService userCommandService,
            IRecommendationService recommendationService,
            IMongoCollection<UserProfile> userProfiles)
        {
            _tests = context.Tests;
            _testSessions = context.TestSessions;
            _userKeyUsageCollection = context.UserKeyUsage;
            _categoryServices = categoryServices;
            _questionServices = questionServices;
            _userQueryService = userQueryService;
            __userCommandService = userCommandService;
            _emailService = emailService;
            _recommendationService = recommendationService;
            _userProfiles = userProfiles;
        }

        /// Метод для поиска теста по ID
        public async Task<Test?> GetByIdAsync(string id)
        {
            return await _tests.Find(t => t.Id == id).FirstOrDefaultAsync();
        }

        /// Метод для поиска тестов по имени
        public async Task<List<Test>> SearchTestsAsync(string searchTerm)
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
            {
                return await _tests.Find(test => true).ToListAsync();
            }

            var filter = Builders<Test>.Filter.Regex(t => t.Name, new BsonRegularExpression(searchTerm, "i"));
            var result = await _tests.Find(filter).ToListAsync();

            // Если результат пуст (не найдено ни одного теста), возвращаем все тесты
            if (result == null || result.Count == 0)
            {
                result = await _tests.Find(test => true).ToListAsync();
            }

            return result;
        }

        // Метод для вывода пользователей на доску почета
        public async Task<List<HonorBoardEntry>> GetHonorBoardAsync(string testId)
        {
            // Получаем 10 лучших сессий по Score (и только завершённые)
            var topSessions = await _testSessions
                .Find(s => s.TestId == testId && s.Score != null && s.PointsAwarded)
                .SortByDescending(s => s.Score)
                .Limit(10)
                .ToListAsync();

            var honorBoard = new List<HonorBoardEntry>();

            foreach (var session in topSessions)
            {
                if (!string.IsNullOrEmpty(session.UserId))
                {
                    var user = await _userQueryService.GetByIdAsync(session.UserId); // <-- замени на актуальный метод

                    if (user != null)
                    {
                        honorBoard.Add(new HonorBoardEntry
                        {
                            UserName = $"{user.Name} {user.Surname}",
                            Score = (int)Math.Round(session.Score ?? 0),
                            CompletedAt = session.EndTime ?? DateTime.MinValue
                        });
                    }
                }
            }

            return honorBoard;
        }
        // Метод для отправки результата теста на почту
        public async Task SendResultEmailAsync(EmailRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.ToEmail) || string.IsNullOrWhiteSpace(request.Subject) || string.IsNullOrWhiteSpace(request.Message))
            {
                throw new ArgumentException("Email, Subject and Message cannot be null or empty.");
            }
            await _emailService.SendEmailAsync(request.ToEmail, request.Subject, request.Message);
        }
        public async Task<(int StatusCode, object Response)> CreateTestAsync(CreateTestDto newTestDto)
        {
            var newTest = new Test
            {
                Name = newTestDto.Name,
                Time = newTestDto.Time,
                Questions = newTestDto.Questions.Select(q => new TestQuestion
                {
                    CategoryId = q.CategoryId,
                    Quantity = q.Quantity
                }).ToList()
            };

            await _tests.InsertOneAsync(newTest);
            return (200, new { message = "Тест успешно создан", test = newTest });
        }

        public async Task<(int StatusCode, object Response)> GetTestByIdAsync(string id)
        {
            if (!ObjectId.TryParse(id, out _))
            {
                return (400, new { message = "Некорректный формат Id теста" });
            }

            var test = await _tests.Find(t => t.Id == id).FirstOrDefaultAsync();
            if (test == null)
                return (404, new { message = "Тест не найден" });

            var categoryIds = test.Questions.Select(q => q.CategoryId).Distinct().ToList();
            var categoryMap = new Dictionary<string, string>();

            foreach (var catId in categoryIds)
            {
                var category = await _categoryServices.GetAsync(catId);
                categoryMap[catId] = category?.Name ?? "Неизвестная категория";
            }

            var questionsWithNames = test.Questions.Select(q => new
            {
                q.CategoryId,
                CategoryName = categoryMap[q.CategoryId],
                q.Quantity
            });

            return (200, new { test.Id, test.Name, test.Time, Questions = questionsWithNames });
        }


        public async Task<(int StatusCode, object Response)> GetAllTestsAsync()
        {
            var tests = await _tests.Find(_ => true).ToListAsync();
            return (200, tests);
        }

        public async Task<(int StatusCode, object Response)> UpdateTestAsync(string id, Test updatedTest)
        {
            await _tests.ReplaceOneAsync(t => t.Id == id, updatedTest);
            return (200, new { message = "Тест успешно обновлён", test = updatedTest });
        }

        public async Task<(int StatusCode, object Response)> DeleteTestAsync(string id)
        {
            await _tests.DeleteOneAsync(t => t.Id == id);
            return (200, new { message = "Тест успешно удалён" });
        }

        public async Task<(int StatusCode, object Response)> GenerateQuestionsForTestAsync(string id)
        {
            var test = await _tests.Find(t => t.Id == id).FirstOrDefaultAsync();
            if (test == null) return (404, new { message = "Тест не найден" });

            var selectedQuestions = new List<Question>();
            foreach (var config in test.Questions)
            {
                var availableQuestions = await _questionServices.GetQuestionsByCategoryAsync(config.CategoryId);
                if (availableQuestions == null || availableQuestions.Count == 0)
                    return (404, new { message = $"В категории {config.CategoryId} нет вопросов." });

                // Исключаем вопросы, которые уже выбраны для этой категории
                availableQuestions = availableQuestions
                                    .Where(q => !selectedQuestions.Any(sq => sq.Id == q.Id && sq.CategoryId == config.CategoryId))
                                    .ToList();

                var randomizedQuestions = availableQuestions.OrderBy(q => System.Guid.NewGuid()).ToList();
                selectedQuestions.AddRange(randomizedQuestions.Take(config.Quantity));
            }

            return (200, new { test.Id, test.Name, test.Time, GeneratedQuestions = selectedQuestions });
        }

        public async Task<(int StatusCode, object Response)> CreateCodeForTestAsync(string testId, string userId)
        {
            // Получаем тест по testId
            var test = await _tests.Find(t => t.Id == testId).FirstOrDefaultAsync();
            if (test == null)
            {
                return (404, new { message = "Тест не найден" });
            }

            // Проверяем, является ли пользователь администратором.
            bool isAdmin = await _userQueryService.IsUserAdmin(userId); // реализуйте этот метод, если его еще нет

            // Если обычный пользователь – проверяем лимит выдачи ключей за сегодня.
            if (!isAdmin)
            {
                var today = DateTime.UtcNow.Date;
                var docId = $"{userId}_{today:yyyyMMdd}";

                var usage = await _userKeyUsageCollection.Find(u => u.Id == docId).FirstOrDefaultAsync();

                // Если документ существует и количество ключей >= 3 – возвращаем ошибку
                if (usage != null && usage.Count >= 3)
                {
                    return (400, new { message = "Превышен лимит выдачи ключей за сегодня, попробуйте завтра" });
                }
            }
            // Генерация нового ключа (администраторы и обычные пользователи)
            var generatedKey = MongoDB.Bson.ObjectId.GenerateNewId().ToString();

            // Если пользователь не администратор – обновляем счетчик использования
            if (!isAdmin)
            {
                var today = DateTime.UtcNow.Date;
                var docId = $"{userId}_{today:yyyyMMdd}";

                var update = Builders<UserKeyUsage>.Update
                    .Inc(u => u.Count, 1)
                    .Push(u => u.Keys, generatedKey)
                    .SetOnInsert(u => u.UserId, userId)
                    .SetOnInsert(u => u.Date, today);

                var options = new UpdateOptions { IsUpsert = true };
                await _userKeyUsageCollection.UpdateOneAsync(u => u.Id == docId, update, options);
            }
            else
            {
                // Для администратора можно обновить отдельный документ для аудита или просто пропустить обновление.
                // Например:
                // await _adminKeyUsageCollection.UpdateOneAsync(...);
            }

            // Регистрируем ключ в дополнительном in‑memory словаре, если требуется логика прохождения теста
            _generatedTestCodes[generatedKey] = test.Id;

            return (200, new { message = "Код теста успешно создан", key = generatedKey });
        }

        public async Task<(int StatusCode, object Response)> OpenTestAsync(string key, string testId)
        {
            // Проверка корректности кода
            if (!_generatedTestCodes.ContainsKey(key))
            {
                Console.WriteLine($"Код {key} не найден или уже использован.");
                return (404, new { message = "Код не найден или уже использован" });
            }

            var expectedTestId = _generatedTestCodes[key];
            Console.WriteLine($"Ожидаемый TestId: {expectedTestId}, переданный TestId: {testId}");
            if (expectedTestId != testId)
            {
                return (400, new { message = "Ключ не соответствует этому тесту" });
            }

            // Получаем тест из базы
            var test = await _tests.Find(t => t.Id == testId).FirstOrDefaultAsync();
            if (test == null)
            {
                Console.WriteLine($"Тест с ID {testId} не найден.");
                return (404, new { message = "Тест не найден" });
            }

            var selectedQuestions = new List<Question>();
            var random = new Random();

            foreach (var config in test.Questions)
            {
                var availableQuestions = await _questionServices.GetQuestionsByCategoryAsync(config.CategoryId);
                if (availableQuestions == null || availableQuestions.Count == 0)
                {
                    Console.WriteLine($"В категории {config.CategoryId} нет вопросов.");
                    return (404, new { message = $"В категории {config.CategoryId} нет вопросов." });
                }

                var randomizedQuestions = availableQuestions.OrderBy(q => random.Next()).ToList();
                selectedQuestions.AddRange(randomizedQuestions.Take(config.Quantity));
            }

            // Создаём тестовую сессию
            var testSession = new TestSession
            {
                TestId = test.Id,
                Questions = selectedQuestions,
                StartTime = DateTime.UtcNow
            };

            try
            {
                await _testSessions.InsertOneAsync(testSession);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Ошибка при создании сессии: {ex.Message}");
                return (500, new { message = "Ошибка создания сессии", details = ex.Message });
            }

            // Удаляем ключ только в конце успешной операции
            _generatedTestCodes.Remove(key);

            return (200, new
            {
                SessionId = testSession.Id,
                TestId = test.Id,
                test.Name,
                test.Time,
                Questions = selectedQuestions
            });
        }

        //Метод завершения теста...
        public async Task<(int StatusCode, object Response)> FinishTestAsync(FinishTestDto dto)
{
    var filter = Builders<TestSession>.Filter.Eq(s => s.Id, dto.SessionId);
    var session = await _testSessions.Find(filter).FirstOrDefaultAsync();
    if (session == null)
    {
        return (404, new { message = "Сессия теста не найдена" });
    }

    session.Answers = dto.Answers;
    session.EndTime = DateTime.UtcNow;

    if (!string.IsNullOrWhiteSpace(dto.UserId))
    {
        session.UserId = dto.UserId;
    }

    session.Score = CalculateTestScore(session);

    if (session.PointsAwarded)
    {
        return (400, new { message = "Балл уже начислен за эту сессию" });
    }

    bool duplicateAttempt = false;
    if (!string.IsNullOrWhiteSpace(dto.UserId))
    {
        var duplicateFilter = Builders<TestSession>.Filter.Where(s =>
            s.UserId == dto.UserId &&
            s.TestId == session.TestId &&
            s.PointsAwarded == true);
        var duplicateSession = await _testSessions.Find(duplicateFilter).FirstOrDefaultAsync();
        if (duplicateSession != null)
        {
            duplicateAttempt = true;
        }
    }

    string responseMessage;
    bool isFirstAttempt = false;
    if (!duplicateAttempt)
    {
        session.PointsAwarded = true;
        responseMessage = $"Результаты сохранены и баллы начислены. Ваш результат: {session.Score} баллов.";
        isFirstAttempt = true;
    }
    else
    {
        responseMessage = $"Тест завершён. Ранее баллы уже начислены. Ваш результат: {session.Score} баллов.";
    }

    await _testSessions.ReplaceOneAsync(filter, session);

    if (isFirstAttempt && !string.IsNullOrWhiteSpace(session.UserId))
    {
        var updateSuccess = await __userCommandService.IncrementUserPointsAsync(session.UserId, session.Score ?? 0);
        if (!updateSuccess)
        {
            return (500, new { message = "Ошибка начисления баллов пользователю" });
        }
    }

    var questionIds = session.Answers
        .Select(a => a.QuestionId)
        .Where(id => !string.IsNullOrWhiteSpace(id))
        .Select(id => id!)
        .ToList();

    var questions = await _questionServices.GetQuestionsByIdsAsync(questionIds);
    var questionDict = questions
        .Where(q => q.Id != null)
        .ToDictionary(q => q.Id!, q => q);

    int correctCount = session.Answers.Count(a =>
        a.QuestionId != null &&
        questionDict.TryGetValue(a.QuestionId, out var question) &&
        question.Answer == a.Answer);

    int totalQuestions = session.Answers.Count;

    var categoryResults = session.Answers
        .Where(a => a.QuestionId != null && questionDict.ContainsKey(a.QuestionId))
        .GroupBy(a => questionDict[a.QuestionId!].CategoryName)
        .Select(g => new
        {
            Category = g.Key,
            Correct = g.Count(a => questionDict[a.QuestionId!].Answer == a.Answer),
            Total = g.Count()
        })
        .ToList();

    // 🔽 Обновление или создание UserProfile
    if (!string.IsNullOrWhiteSpace(session.UserId))
    {
        var profileFilter = Builders<UserProfile>.Filter.Eq(p => p.UserId, session.UserId);
        var existingProfile = await _userProfiles.Find(profileFilter).FirstOrDefaultAsync();

        var updatedScores = categoryResults.Select(r => new CategoryScore
        {
            Category = r.Category,
            CorrectAnswers = r.Correct,
            TotalQuestions = r.Total
        }).ToList();

        if (existingProfile == null)
        {
            var newProfile = new UserProfile
            {
                UserId = session.UserId!,
                CategoryScores = updatedScores
            };
            await _userProfiles.InsertOneAsync(newProfile);
        }
        else
        {
            // Здесь можно сделать усреднение, если хочешь учитывать прогресс
            existingProfile.CategoryScores = updatedScores;
            await _userProfiles.ReplaceOneAsync(profileFilter, existingProfile);
        }
    }

    var recommendations = await _recommendationService.GetRecommendationsAsync((int)(session.Score ?? 0), session.UserId ?? string.Empty);

    return (200, new
    {
        message = responseMessage,
        score = session.Score,
        isFirstAttempt,
        correctCount,
        totalQuestions,
        categoryResults,
        recommendations
    });
}

        private double CalculateTestScore(TestSession session)
        {
            double score = 0;

            // Для каждого вопроса, который был сгенерирован для прохождения теста
            foreach (var question in session.Questions)
            {
                // Находим ответ кандидата для данного вопроса (соответствие по идентификатору вопроса)
                var candidateAnswer = session.Answers.FirstOrDefault(a => a.QuestionId == question.Id);

                // Если кандидат ответил на вопрос и ответ не пустой
                if (candidateAnswer != null && !string.IsNullOrWhiteSpace(candidateAnswer.Answer))
                {
                    // Сравниваем (без учета регистра и пробелов) правильный ответ с ответом кандидата
                    if (string.Equals(candidateAnswer.Answer.Trim(), question.Answer.Trim(), StringComparison.OrdinalIgnoreCase))
                    {
                        // Если совпадает, прибавляем к общему счёту количество очков, заданное для вопроса
                        score += question.Point;
                    }
                }
            }
            return score;
        }
    }
}
