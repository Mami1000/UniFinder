using Enroll.Models;
using MongoDB.Driver;
using Enroll.Interfaces;

namespace Enroll.Services
{
    public class UserService : IUserQueryService, IUserCommandService
    {
        private readonly IMongoCollection<User> _users;

        public UserService(IMongoDbContext context)
        {
            _users = context.Users;
        }

        public bool TryAuthenticate(string login, string password, out User? authenticatedUser)
        {
            var users = _users.AsQueryable().ToList();
            authenticatedUser = _users
                .Find(u => u.Email == login || u.PhoneNumber == login)
                .FirstOrDefault();

            if (authenticatedUser != null)
            {

                if (BCrypt.Net.BCrypt.Verify(password, authenticatedUser.Password))
                    return true;

                Console.WriteLine("Пароль не совпал");
            }
            else
            {
                Console.WriteLine("Пользователь не найден");
            }

            authenticatedUser = null;
            return false;
        }
        public User? FindByLogin(string login)
        {
            return _users.Find(u => u.Email == login || u.PhoneNumber == login).FirstOrDefault();
        }

        public User Create(User user)
        {
            user.Role ??= "user";
            _users.InsertOne(user);
            return user;
        }


        public User GetById(string id) =>
            _users.Find(u => u.Id == id).FirstOrDefault();

        public User Update(User user)
        {
            var filter = Builders<User>.Filter.Eq(u => u.Id, user.Id);
            _users.ReplaceOne(filter, user);
            return user;
        }

        public async Task<List<User>> GetAsync() =>
            await _users.Find(_ => true).ToListAsync();

        public async Task<bool> IsUserAdmin(string userId)
        {
            var user = await _users.Find(u => u.Id == userId).FirstOrDefaultAsync();
            return user?.Role?.Equals("admin", StringComparison.OrdinalIgnoreCase) == true;
        }

        public async Task<bool> IncrementUserPointsAsync(string userId, double points)
        {
            var filter = Builders<User>.Filter.Eq(u => u.Id, userId);
            var update = Builders<User>.Update.Inc(u => u.Userpoint, points);
            var result = await _users.UpdateOneAsync(filter, update);
            return result.ModifiedCount > 0;
        }

        public User UpdateProfile(UpdateUserDto updateDto)
        {
            var user = GetById(updateDto.Id) ?? throw new Exception("Пользователь не найден");

            user.Name = updateDto.Name;

            if (!string.IsNullOrEmpty(updateDto.Password))
                user.Password = BCrypt.Net.BCrypt.HashPassword(updateDto.Password);

            if (!string.IsNullOrEmpty(updateDto.PhotoURL))
                user.PhotoURL = updateDto.PhotoURL;

            return Update(user);
        }
        public async Task<User?> GetByIdAsync(string id)
        {
            return await _users.Find(u => u.Id == id).FirstOrDefaultAsync();
        }
    }
}
