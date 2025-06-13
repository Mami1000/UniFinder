using Enroll.Models;

namespace Enroll.Interfaces
{
       public interface IUserQueryService
       {
              Task<User?> GetByIdAsync(string id);
              Task<List<User>> GetAsync();
              Task<bool> IsUserAdmin(string userId);
              User? FindByLogin(string login);
           
    }

}