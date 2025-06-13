public interface IResetPasswordTrackerService
{
    /// <summary>
    /// Получает количество запросов на сброс пароля для указанного email за заданное время.
    /// </summary>
    Task<int> GetRequestCountAsync(string email);

    /// <summary>
    /// Регистрирует новый запрос на сброс пароля для указанного email.
    /// </summary>
    Task RecordRequestAsync(string email);
}
