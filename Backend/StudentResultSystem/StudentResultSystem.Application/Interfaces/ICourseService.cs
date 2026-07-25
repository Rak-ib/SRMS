

namespace StudentResultSystem.Application.Interfaces;

public interface ICourseService
{
    Task<IEnumerable<CourseResponseDto>> GetAllCoursesAsync();
    Task<CourseResponseDto> GetCourseByIdAsync(int id);
    Task<CourseResponseDto> CreateCourseAsync(CourseCreateDto courseCreateDto);
    Task<CourseResponseDto> UpdateCourseAsync(int id, CourseUpdateDto courseUpdateDto);
    Task<bool> DeleteCourseAsync(int id);
    Task<IEnumerable<CourseResponseDto>> GetCoursesByDepartmentAsync(int departmentId);
}