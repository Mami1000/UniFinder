using Enroll.Interfaces;
using Microsoft.Extensions.Caching.Memory;

namespace Enroll.Services
{
public class ResetPasswordTrackerService : IResetPasswordTrackerService
{
    private readonly IMemoryCache _cache;
    // Ограничение по времени, например, 24 часа
    private readonly TimeSpan _timeWindow = TimeSpan.FromHours(24);

    public ResetPasswordTrackerService(IMemoryCache cache)
    {
        _cache = cache;
    }

    //Для получения колличества запросов асинхронно
    public Task<int> GetRequestCountAsync(string email)
    {
        // Объявляем timestamps как nullable
        if (!_cache.TryGetValue(email, out List<DateTime>? timestamps) || timestamps == null)
        {
            return Task.FromResult(0);
        }

        // Фильтруем записи: оставляем только те, что произошли в пределах _timeWindow
        timestamps = timestamps.Where(dt => dt > DateTime.UtcNow - _timeWindow).ToList();
        // Обновляем кэш с заданным временем хранения _timeWindow
        _cache.Set(email, timestamps, _timeWindow);
        return Task.FromResult(timestamps.Count);
    }

    //Для запросов на сбрасывание пароля асинхронно
    public Task RecordRequestAsync(string email)
    {
        List<DateTime>? timestamps;
        if (!_cache.TryGetValue(email, out timestamps) || timestamps == null)
        {
            timestamps = new List<DateTime>();
        }
        // Фильтруем устаревшие записи
        timestamps = timestamps.Where(dt => dt > DateTime.UtcNow - _timeWindow).ToList();

        timestamps.Add(DateTime.UtcNow);
        _cache.Set(email, timestamps, _timeWindow);
        return Task.CompletedTask;
    }
  }
}