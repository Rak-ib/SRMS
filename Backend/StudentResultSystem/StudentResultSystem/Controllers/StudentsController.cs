using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentResultSystem.Application.DTOs.Student;
using StudentResultSystem.Application.Interfaces;
using System.Security.Claims;

namespace StudentResultSystem.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StudentsController : ControllerBase
{
    private readonly IStudentService _studentService;

    public StudentsController(IStudentService studentService)
    {
        _studentService = studentService;
    }

    [HttpGet("me")]
    public async Task<ActionResult<StudentResponseDto>> GetMyProfile()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userIdClaim == null)
            return Unauthorized();

        var userId = int.Parse(userIdClaim);

        var student = await _studentService.GetMyProfileAsync(userId);
        if (student == null)
            return NotFound("No student record linked to this account.");

        return Ok(student);
    }


    // GET: api/students
    [HttpGet]
    public async Task<ActionResult<IEnumerable<StudentResponseDto>>> GetAll()
    {
        var students = await _studentService.GetAllAsync();
        return Ok(students);
    }

    // GET: api/students/5
    [HttpGet("{id:int}")]
    public async Task<ActionResult<StudentResponseDto>> GetById(int id)
    {
        var student = await _studentService.GetByIdAsync(id);
        if (student == null)
            return NotFound($"Student with Id {id} not found.");

        return Ok(student);
    }

    // GET: api/students/department/2
    [HttpGet("department/{departmentId:int}")]
    public async Task<ActionResult<IEnumerable<StudentResponseDto>>> GetByDepartment(int departmentId)
    {
        var students = await _studentService.GetByDepartmentAsync(departmentId);
        return Ok(students);
    }

    // POST: api/students
    [HttpPost]
    public async Task<ActionResult<StudentResponseDto>> Create(StudentCreateDto dto)
    {
        try
        {
            var created = await _studentService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(ex.Message);
        }
    }

    // PUT: api/students/5
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, StudentUpdateDto dto)
    {
        var updated = await _studentService.UpdateAsync(id, dto);
        if (!updated)
            return NotFound($"Student with Id {id} not found.");

        return NoContent();
    }

    // DELETE: api/students/5
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _studentService.DeleteAsync(id);
        if (!deleted)
            return NotFound($"Student with Id {id} not found.");

        return NoContent();
    }
}