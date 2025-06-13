using Enroll.DTOs;
using Enroll.Interfaces;
using Enroll.Models;
using Microsoft.AspNetCore.Mvc;
using System;

namespace Enroll.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly IUserQueryService _userQueryService;
        private readonly IUserCommandService _userCommandService;
        private readonly IEncryptionService _encryptionService;
        private readonly IContentTypeProvider _contentTypeProvider;

        public UserController(
            IUserQueryService userQueryService,
            IUserCommandService userCommandService,
            IEncryptionService encryptionService,
            IContentTypeProvider contentTypeProvider)
        {
            _userQueryService = userQueryService;
            _userCommandService = userCommandService;
            _encryptionService = encryptionService;
            _contentTypeProvider = contentTypeProvider;
        }

        // Обновление профиля пользователя
        [HttpPut("update")]
        public IActionResult UpdateProfile([FromBody] UpdateUserDto updateDto)
        {
            try
            {
                var updatedUser = _userCommandService.UpdateProfile(updateDto);
                return Ok(new { message = "Профиль успешно обновлен", user = updatedUser });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Ошибка обновления профиля", details = ex.Message });
            }
        }

        // Получение пользователя по Id
        [HttpGet("{id:length(24)}")]
        public IActionResult GetUserById(string id)
        {
            if (string.IsNullOrEmpty(id))
            {
                return BadRequest(new { message = "Некорректный формат Id пользователя" });
            }

            var user = _userQueryService.GetByIdAsync(id);
            if (user == null)
            {
                return NotFound(new { message = "Пользователь не найден" });
            }

            return Ok(user);
        }
    }
}
