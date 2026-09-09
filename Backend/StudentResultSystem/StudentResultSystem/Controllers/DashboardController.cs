using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentResultSystem.Application.Interfaces;





namespace StudentResultSystem.Controllers;


[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,Teacher")]
public class DashboardController : ControllerBase
{
    private readonly IStudentRepository _studentRepository;
    private readonly ICourseRepository _courseRepository;
    private readonly IEnrollmentRepository _enrollmentRepository;
    private readonly IDeptRepository _deptRepository;

    public DashboardController(IStudentRepository studentRepository, ICourseRepository courseRepository, IEnrollmentRepository enrollmentRepository, IDeptRepository deptRepository)
    {
        _studentRepository = studentRepository;
        _courseRepository = courseRepository;
        _enrollmentRepository = enrollmentRepository;
        _deptRepository = deptRepository;
    }
    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        var summary = new
        {
            TotalStudents = await _studentRepository.CountAsync(),
            TotalCourses = await _courseRepository.CountAsync(),
            TotalDepartments = await _deptRepository.CountAsync(),
            TotalEnrollments = await _enrollmentRepository.CountAsync()
        };
        return Ok(summary);
    }

}
