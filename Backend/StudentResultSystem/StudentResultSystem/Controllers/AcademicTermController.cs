


using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentResultSystem.Application.Interfaces;

namespace StudentResultSystem.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]

public class AcademicTermController : ControllerBase
{
    private readonly IAcademicTermService _academicTermService;
    public AcademicTermController(IAcademicTermService academicTermService)
    {
        _academicTermService = academicTermService;
    }
    // GET: api/academicterm
    [HttpGet]
    public async Task<ActionResult<IEnumerable<AcademicTermResponseDto>>> GetAll()
    {
        var terms = await _academicTermService.GetAllTermsAsync();
        return Ok(terms);
    }
    // GET: api/academicterm/5
    [HttpGet("{id:int}")]
    public async Task<ActionResult<AcademicTermResponseDto>> GetById(int id)
    {
        var term = await _academicTermService.GetTermByIdAsync(id);
        if (term == null)
            return NotFound($"Academic Term with Id {id} not found.");
        return Ok(term);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _academicTermService.DeleteTermAsync(id);
        if (!result)
            return NotFound($"Academic Term with Id {id} not found.");
        return NoContent();
    }

    [HttpPost]
    public async Task<ActionResult<AcademicTermResponseDto>> Create(AcademicTermCreateDto dto)
    {
        var created = await _academicTermService.CreateTermAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPatch]
    [Route("{id:int}")]
    public async Task<IActionResult> Update(int id, AcademicTermUpdateDto dto)
    {
        var result = await _academicTermService.UpdateTermAsync(dto);
        if (!result)
            return NotFound($"Academic Term with Id {id} not found.");
        return NoContent();
    }


}

