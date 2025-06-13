using Enroll.DTOs;
using Enroll.Interfaces;
using Enroll.Models;
using Microsoft.AspNetCore.Mvc;

namespace Enroll.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UniversitiesController : ControllerBase
{
    private readonly IUniversityReaderService _reader;
    private readonly IUniversityWriterService _writer;

    public UniversitiesController(IUniversityReaderService reader, IUniversityWriterService writer)
    {
        _reader = reader;
        _writer = writer;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _reader.GetAllAsync();
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var result = await _reader.GetByIdAsync(id);
        return result is null ? NotFound(new { message = "Не найдено" }) : Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromForm] UniversityDto dto)
    {
        if (dto is null)
            return BadRequest(new { message = "Данные не заданы" });

        var model = new University
        {
            Name = dto.Name,
            Location = dto.Location,
            Description = dto.Description,
            Courses = dto.Courses,
            LogoUrl = dto.LogoUrl
        };

        var created = await _writer.CreateAsync(model);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromForm] UniversityDto dto)
    {
        var university = await _reader.GetByIdAsync(id);
        if (university is null)
            return NotFound(new { message = "Университет не найден" });

        university.Name = dto.Name;
        university.Location = dto.Location;
        university.Description = dto.Description;
        university.Courses = dto.Courses;
        if (!string.IsNullOrWhiteSpace(dto.LogoUrl))
            university.LogoUrl = dto.LogoUrl;

        await _writer.UpdateAsync(university);
        return Ok(university);
    }       
}
