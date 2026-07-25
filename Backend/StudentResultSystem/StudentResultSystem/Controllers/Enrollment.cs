

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentResultSystem.Application.Interfaces;

namespace StudentResultSystem.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]

public class EnrollmentController : ControllerBase
{
    private readonly IEnrollmentService _enrollmentService;
    public EnrollmentController(IEnrollmentService enrollmentService)
    {
        _enrollmentService = enrollmentService;
    }

    [HttpGet("student/{studentId}")]
    public async Task<IActionResult> GetEnrollmentsByStudentId(int studentId)
    {
        var enrollments = await _enrollmentService.GetEnrollmentsByStudentIdAsync(studentId);
        return Ok(enrollments);
    }

    [HttpGet("course/{courseId}")]
    public async Task<IActionResult> GetEnrollmentsByCourseId(int courseId)
    {
        var enrollments = await _enrollmentService.GetEnrollmentsByCourseIdAsync(courseId);
        return Ok(enrollments);
    }

    [HttpGet("academic-term/{academicTermId}")]
    public async Task<IActionResult> GetEnrollmentsByAcademicTermId(int academicTermId)
    {
        var enrollments = await _enrollmentService.GetEnrollmentsByAcademicTermIdAsync(academicTermId);
        return Ok(enrollments);
    }

    [HttpPost]
    public async Task<IActionResult> CreateEnrollment( EnrollmentCreateDto enrollment)
    {
        await _enrollmentService.CreateEnrollmentAsync(enrollment);
        return CreatedAtAction(nameof(GetEnrollmentsByStudentId), new { studentId = enrollment.StudentId }, enrollment);
    }

    [HttpPatch]
    [Route("{id:int}")]
    public async Task<IActionResult> UpdateEnrollment(int id, EnrollmentUpdateDto enrollment)
    {
        await _enrollmentService.UpdateEnrollmentAsync(id,enrollment);
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteEnrollment(int id)
    {
        await _enrollmentService.DeleteEnrollmentAsync(id);
        return NoContent();
    }

    [HttpGet]
    public async Task<IActionResult> GetAllEnrollments()
    {
        var enrollments = await _enrollmentService.GetAllEnrollmentsAsync();
        return Ok(enrollments);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetEnrollmentById(int id)
    {
        var enrollment = await _enrollmentService.GetEnrollmentByIdAsync(id);
        if (enrollment == null)
            return NotFound($"Enrollment with Id {id} not found.");
        return Ok(enrollment);
    }
}
