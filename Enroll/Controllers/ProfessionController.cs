using Enroll.Interfaces;
using Enroll.Models;
using Microsoft.AspNetCore.Mvc;

namespace Enroll.Controllers;

[ApiController]
[Route("api/profession")]

public class ProfessionController : ControllerBase
{
    private readonly IProfessionService _service;
    public ProfessionController(IProfessionService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await _service.GetAllAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(string id)
    {
        var profession = await _service.GetByIdAsync(id);
        if (profession == null) return NotFound();
        return Ok(profession);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Profession profession)
    {
        await _service.CreateAsync(profession);
        return CreatedAtAction(nameof(Get), new { id = profession.Id }, profession);
    }

    [HttpPost("bulk")]
    public async Task<IActionResult> BulkCreate([FromBody] List<Profession> professions)
    {
        if (professions == null || !professions.Any())
            return BadRequest("Список профессий пуст или невалиден.");

        await _service.BulkCreateAsync(professions);
        return Ok(new
        {
            message = "Профессии успешно добавлены.",
            count = professions.Count
        });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] Profession profession)
    {
        var existing = await _service.GetByIdAsync(id);
        if (existing == null) return NotFound();

        profession.Id = id;
        await _service.UpdateAsync(id, profession);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var existing = await _service.GetByIdAsync(id);
        if (existing == null) return NotFound();

        await _service.DeleteAsync(id);
        return NoContent();
    }
}
