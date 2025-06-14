using Enroll.DTOs;
using Enroll.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Enroll.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("forgotpassword")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            if (string.IsNullOrEmpty(request.Email))
                return BadRequest(new { message = "Email обязателен." });

            var result = await _authService.ForgotPasswordAsync(request.Email);
            return result.Success
                ? Ok(new { message = result.Message })
                : BadRequest(new { message = result.Message });
        }

        [HttpPost("resetpassword")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            var result = await _authService.ResetPasswordAsync(request);
            return result.Success
                ? Ok(new { message = result.Message })
                : BadRequest(new { message = result.Message });
        }

        [HttpGet("verifytoken")]
        public async Task<IActionResult> VerifyToken([FromQuery] string token)
        {
            var result = await _authService.VerifyTokenAsync(token);
            return result.Valid
                ? Ok(new { valid = true })
                : BadRequest(new { valid = false, message = result.Message });
        }
       [HttpPost("register")]
        public IActionResult Register([FromBody] RegisterRequestDto registerRequest)
        {
            try
            {
                var result = _authService.Register(registerRequest);
                if (!result.Success)
                    return BadRequest(new { message = result.Message });

                return Ok(new
                {
                    message = result.Message,
                    token = result.Token,
                    refreshToken = result.RefreshToken,
                    user = result.User
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Ошибка регистрации", details = ex.Message });
            }
        }
        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest loginRequest)
        {
            var result = _authService.Login(loginRequest);
            return result.Success
                ? Ok(new
                {
                    message = result.Message,
                    token = result.Token,
                    refreshToken = result.RefreshToken,
                    user = result.User
                })
                : Unauthorized(new { message = result.Message });
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout([FromBody] LogoutRequestDto request)
        {
            if (string.IsNullOrEmpty(request.UserId))
            {
                return BadRequest(new { message = "UserId обязателен." });
            }

            var result = await _authService.LogoutAsync(request.UserId);
            return result.Success
                ? Ok(new { message = result.Message })
                : NotFound(new { message = result.Message });
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh([FromBody] TokenRefreshRequest request)
        {
            var result = await _authService.RefreshAsync(request.RefreshToken);
            return result.Success
                ? Ok(new
                {
                    token = result.AccessToken,
                    refreshToken = result.RefreshToken
                })
                : Unauthorized(new { message = result.Message });
        }
    }
}
