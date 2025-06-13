using Enroll.Models;

namespace Enroll.Interfaces
{
   public interface IUserCommandService
    {
        bool TryAuthenticate(string login, string password, out User? authenticatedUser);
        User Create(User user);
        User Update(User user);
        User UpdateProfile(UpdateUserDto updateDto);
        Task<bool> IncrementUserPointsAsync(string userId, double points);
    }
}