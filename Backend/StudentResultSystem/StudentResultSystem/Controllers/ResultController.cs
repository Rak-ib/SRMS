
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentResultSystem.Application.Interfaces;

namespace StudentResultSystem.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ResultController : ControllerBase
{
    private readonly IResultService _resultService;
    public ResultController(IResultService resultService)
    {
        _resultService = resultService;
    }
    [HttpGet("enrollment/{enrollmentId}")]
    public async Task<IActionResult> GetResultByEnrollmentId(int enrollmentId)
    {
        var result = await _resultService.GetByEnrollmentIdAsync(enrollmentId);
        if (result == null)
        {
            return NotFound();
        }
        return Ok(result);
    }
    [HttpPost]
    public async Task<IActionResult> CreateResult(ResultCreateDto result)
    {
        await _resultService.AddResultAsync(result);
        return CreatedAtAction(nameof(GetResultByEnrollmentId), new { enrollmentId = result.EnrollmentId }, result);
    }
    [HttpPatch("{id:int}")]
    public async Task<IActionResult> UpdateResult(int id, ResultUpdateDto result)
    {
        await _resultService.UpdateResultAsync(id, result);
        return NoContent();
    }
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteResult(int id)
    {
        await _resultService.DeleteResultAsync(id);
        return NoContent();
    }

    [HttpGet("student/{studentId:int}/cgpa")]
    public async Task<IActionResult> GetCgpa(int studentId)
    {
        var cgpa = await _resultService.CalculateCgpaAsync(studentId);
        return Ok(cgpa);
    }

    [HttpGet("student/{studentId:int}")]
    public async Task<IActionResult> GetResultsByStudentId(int studentId)
    {
        var results = await _resultService.GetResultsByStudentIdAsync(studentId);
        return Ok(results);
    }
}