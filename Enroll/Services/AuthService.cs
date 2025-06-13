using Enroll.DTOs;
using Enroll.Interfaces;
using Enroll.Models;
using Microsoft.Extensions.Configuration;
using MongoDB.Driver;

namespace Enroll.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserQueryService _userQueryService;
        private readonly IUserCommandService _userCommandService;
        private readonly IConfiguration _configuration;
        private readonly IEmailService _emailService;
        private readonly IResetPasswordTrackerService _resetRequestTrackerService;
        private readonly IMongoCollection<PasswordResetToken> _passwordResetTokens;
        private readonly ITokenService _tokenService;

        public AuthService(
            IConfiguration configuration,
            IUserQueryService userQueryService,
            IUserCommandService userCommandService,
            IEmailService emailService,
            IMongoCollection<PasswordResetToken> passwordResetTokens,
            IResetPasswordTrackerService resetRequestTrackerService,
            ITokenService tokenService
        )
        {
            _configuration = configuration;
            _userQueryService = userQueryService;
            _userCommandService = userCommandService;
            _emailService = emailService;
            _passwordResetTokens = passwordResetTokens;
            _resetRequestTrackerService = resetRequestTrackerService;
            _tokenService = tokenService;
        }

        public async Task<(bool Success, string Message)> ForgotPasswordAsync(string email)
        {
            if (string.IsNullOrEmpty(email))
                return (false, "Email обязателен.");

            const int maxAttempts = 3;
            int requestCount = await _resetRequestTrackerService.GetRequestCountAsync(email);
            if (requestCount >= maxAttempts)
                return (false, "Превышено количество попыток сброса пароля. Пожалуйста, повторите попытку позже.");

            await _resetRequestTrackerService.RecordRequestAsync(email);

            var user = _userQueryService.FindByLogin(email);
            if (user == null)
                return (true, "Если email существует, отправлено письмо с инструкциями.");

            var token = Guid.NewGuid().ToString();
            var tokenEntry = new PasswordResetToken
            {
                UserId = user.Id,
                Token = token,
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddHours(1),
                IsUsed = false
            };

            await _passwordResetTokens.InsertOneAsync(tokenEntry);

            var clientBaseUrl = _configuration["ClientBaseUrl"];
            var resetLink = $"{clientBaseUrl}/reset-password?token={token}";
            await _emailService.SendResetPasswordEmailAsync(user.Email, resetLink);

            return (true, "Если email существует, отправлено письмо с инструкциями.");
        }

        public async Task<(bool Success, string Message)> ResetPasswordAsync(ResetPasswordRequest request)
        {
            if (string.IsNullOrEmpty(request.Token) || string.IsNullOrEmpty(request.NewPassword))
                return (false, "Token и новый пароль обязательны.");

            var tokenEntry = await _passwordResetTokens
                .Find(Builders<PasswordResetToken>.Filter.Eq(x => x.Token, request.Token))
                .FirstOrDefaultAsync();

            if (tokenEntry == null || tokenEntry.ExpiresAt < DateTime.UtcNow || tokenEntry.IsUsed)
                return (false, "Неверный, просроченный или уже использованный токен.");

            var user = await _userQueryService.GetByIdAsync(tokenEntry.UserId);
            if (user == null)
                return (false, "Пользователь не найден.");

            user.Password = BCrypt.Net.BCrypt.HashPassword(request.NewPassword, workFactor: 12);
            _userCommandService.Update(user);

            tokenEntry.IsUsed = true;
            await _passwordResetTokens.ReplaceOneAsync(
                Builders<PasswordResetToken>.Filter.Eq(x => x.Id, tokenEntry.Id),
                tokenEntry
            );

            return (true, "Пароль успешно обновлён.");
        }

        public async Task<(bool Valid, string Message)> VerifyTokenAsync(string token)
        {
            if (string.IsNullOrEmpty(token))
                return (false, "Token обязателен.");

            var tokenEntry = await _passwordResetTokens
                .Find(Builders<PasswordResetToken>.Filter.Eq(x => x.Token, token))
                .FirstOrDefaultAsync();

            if (tokenEntry == null || tokenEntry.ExpiresAt < DateTime.UtcNow || tokenEntry.IsUsed)
                return (false, "Неверный, просроченный или использованный токен.");

            return (true, "Токен валиден.");
        }

        public (bool Success, string Message, string? Token, string? RefreshToken, User? User) Login(LoginRequest request)
        {
            var user = _userQueryService.FindByLogin(request.Login);

            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.Password))
                return (false, "Неверный логин или пароль", null, null, null);

            var refreshToken = _tokenService.GenerateRefreshToken();
            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);
            _userCommandService.Update(user);

            var accessToken = _tokenService.GenerateAccessToken(user);
            return (true, "Успешный вход", accessToken, refreshToken, user);
        }

      public (bool Success, string Message, string? Token, string? RefreshToken, User? User) Register(RegisterRequestDto registerRequest)
        {
            if (registerRequest.Password != registerRequest.ConfirmPassword)
                return (false, "Пароли не совпадают", null, null, null);

            var user = new User
            {
                Name = registerRequest.Name,
                Surname = registerRequest.Surname ?? string.Empty,
                Email = registerRequest.Email,
                PhoneNumber = registerRequest.PhoneNumber,
                Password = BCrypt.Net.BCrypt.HashPassword(registerRequest.Password),
                Role = "user",
                PhotoURL = "attachments/default-user.png",
                Userpoint = 0
            };

            var refreshToken = _tokenService.GenerateRefreshToken();
            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);

            _userCommandService.Create(user);

            var accessToken = _tokenService.GenerateAccessToken(user);

            return (true, "Регистрация успешна!", accessToken, refreshToken, user);
        }


        public async Task<(bool Success, string Message)> LogoutAsync(string userId)
        {
            var user = await _userQueryService.GetByIdAsync(userId);
            if (user == null)
                return (false, "Пользователь не найден");

            user.RefreshToken = null;
            user.RefreshTokenExpiry = null;
            _userCommandService.Update(user);

            return (true, "Выход выполнен");
        }

        public async Task<(bool Success, string Message, string? AccessToken, string? RefreshToken)> RefreshAsync(string refreshToken)
        {
            var user = (await _userQueryService.GetAsync())
                .FirstOrDefault(u => u.RefreshToken == refreshToken);

            if (user == null || user.RefreshTokenExpiry < DateTime.UtcNow)
                return (false, "Невалидный или просроченный Refresh Token", null, null);

            var newAccessToken = _tokenService.GenerateAccessToken(user);
            var newRefreshToken = _tokenService.GenerateRefreshToken();

            user.RefreshToken = newRefreshToken;
            user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);
            _userCommandService.Update(user);

            return (true, "Токены обновлены", newAccessToken, newRefreshToken);
        }
    }
}
