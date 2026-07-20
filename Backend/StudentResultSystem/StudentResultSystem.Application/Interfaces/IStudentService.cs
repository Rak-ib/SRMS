using StudentResultSystem.Application.DTOs.Student;

namespace StudentResultSystem.Application.Interfaces;

public interface IStudentService
{
    Task<StudentResponseDto?> GetByIdAsync(int id);
    Task<IEnumerable<StudentResponseDto>> GetAllAsync();
    Task<IEnumerable<StudentResponseDto>> GetByDepartmentAsync(int departmentId);
    Task<StudentResponseDto> CreateAsync(StudentCreateDto dto);
    Task<bool> UpdateAsync(int id, StudentUpdateDto dto);
    Task<bool> DeleteAsync(int id);
}