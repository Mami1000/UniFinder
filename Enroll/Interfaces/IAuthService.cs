using Enroll.DTOs;
using Enroll.Models;

namespace Enroll.Interfaces
{
    public interface IAuthService
    {
        Task<(bool Success, string Message)> ForgotPasswordAsync(string email);
        Task<(bool Success, string Message)> ResetPasswordAsync(ResetPasswordRequest request);
        Task<(bool Valid, string Message)> VerifyTokenAsync(string token);

        (bool Success, string Message, string? Token, string? RefreshToken, User? User) Login(LoginRequest request);
        (bool Success, string Message, string? Token, string? RefreshToken, User? User) Register(RegisterRequestDto registerRequest);

        Task<(bool Success, string Message)> LogoutAsync(string userId);
        Task<(bool Success, string Message, string? AccessToken, string? RefreshToken)> RefreshAsync(string refreshToken);
    }
}
