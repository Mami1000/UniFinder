using Enroll.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Enroll.Controllers
{
    [ApiController]
    [Route("api/media")]
    public class MediaController : ControllerBase
    {
        private readonly IEncryptionService _encryptionService;
        private readonly IContentTypeProvider _contentTypeProvider;
        private readonly IMediaService _mediaService;

        public MediaController(
            IEncryptionService encryptionService,
            IContentTypeProvider contentTypeProvider,
            IMediaService mediaService)
        {
            _encryptionService = encryptionService;
            _contentTypeProvider = contentTypeProvider;
            _mediaService = mediaService;
        }

        [HttpPost("upload-user-photo")]
        [Authorize]
        public async Task<IActionResult> UploadUserPhoto([FromForm] IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "Файл не найден." });

            if (!_contentTypeProvider.IsSupportedContentType(file.ContentType))
                return BadRequest(new { message = "Недопустимый формат файла." });

            try
            {
                // Извлекаем userId (например, через User.Identity.Name или нужный вам claim)
                var userId = User.Identity?.Name;
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized(new { message = "Пользователь не определён." });

                var fileName = await _mediaService.UploadUserPhotoAsync(file, userId);
                return Ok(new { fileName });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Ошибка при загрузке фото профиля", details = ex.Message });
            }
        }


        [HttpPost("upload-university-logo")]
        [Authorize]
        public async Task<IActionResult> UploadUniversityLogo([FromForm] IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "Файл не найден." });

            if (!_contentTypeProvider.IsSupportedContentType(file.ContentType))
                return BadRequest(new { message = "Недопустимый формат файла." });

            try
            {
                string fileName = await _mediaService.UploadUniversityLogoAsync(file);
                return Ok(new { fileName });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Ошибка при обработке логотипа университета", details = ex.Message });
            }
        }

        [HttpPost("upload-question-image")]
        [Authorize] // или [AllowAnonymous], если не нужен логин
        public async Task<IActionResult> UploadQuestionImage([FromForm] IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "Файл не найден." });

            if (!_contentTypeProvider.IsSupportedContentType(file.ContentType))
                return BadRequest(new { message = "Недопустимый формат файла." });

            try
            {
                var fileName = await _mediaService.UploadQuestionImageAsync(file);
                return Ok(new { fileName });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Ошибка при загрузке изображения вопроса", details = ex.Message });
            }
        }


        [HttpGet("decrypt-photo")]
        [AllowAnonymous]
        public async Task<IActionResult> DecryptPhoto([FromQuery] string fileName)
        {
            if (string.IsNullOrWhiteSpace(fileName))
                return BadRequest(new { message = "Имя файла не указано." });
 
            try
            {
                var decryptedBytes = await _mediaService.DecryptPhotoAsync(fileName);
                var contentType = _contentTypeProvider.GetContentType(fileName);
                return File(decryptedBytes, contentType);
            }
            catch (FileNotFoundException ex)
            {
                return NotFound(new { message = "Файл не найден", details = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Ошибка при расшифровке фото", details = ex.Message });
            }
        }
    }
}
