using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentResultSystem.Application.Interfaces;

namespace StudentResultSystem.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CourseController : ControllerBase
{
    private readonly ICourseService _courseService;

    private readonly IUserService _userService;

    public CourseController(ICourseService courseService, IUserService userService)
    {
        _courseService = courseService;
        _userService = userService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllCourses()
    {
        var courses = await _courseService.GetAllCoursesAsync();
        return Ok(courses);
    }

    [HttpGet]
    [Route("{id:int}")]
    public async Task<IActionResult> GetCourseById(int id)
    {
        var course = await _courseService.GetCourseByIdAsync(id);
        return Ok(course);
    }

    [HttpPost]
    public async Task<IActionResult> CreateCourse(CourseCreateDto courseCreateDto)
    {
        var course = await _courseService.CreateCourseAsync(courseCreateDto);
        return CreatedAtAction(nameof(GetCourseById), new { id = course.Id }, course);
    }

    [HttpPatch]
    [Route("{id:int}")]
    public async Task<IActionResult> UpdateCourse(int id, CourseUpdateDto courseUpdateDto)
    {
        var course = await _courseService.UpdateCourseAsync(id, courseUpdateDto);
        return Ok(course);
    }

    [HttpDelete]
    [Route("{id:int}")]
    public async Task<IActionResult> DeleteCourse(int id)
    {
        var result = await _courseService.DeleteCourseAsync(id);
        if (!result)
        {
            return NotFound();
        }
        return NoContent();
    }

    [HttpGet]
    [Route("department/{departmentId:int}")]
    public async Task<IActionResult> GetCoursesByDepartment(int departmentId)
    {
        var courses = await _courseService.GetCoursesByDepartmentAsync(departmentId);
        return Ok(courses);
    }
}
