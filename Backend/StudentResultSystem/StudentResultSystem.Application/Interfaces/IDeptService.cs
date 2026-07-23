using StudentResultSystem.Domain.Entities;


namespace StudentResultSystem.Application.Interfaces;

public interface IDeptService
{
    Task<IEnumerable<Department>> GetAllDepartmentsAsync();
    Task<DeptResponseDto?> GetDepartmentByIdAsync(int id);
    Task<DeptResponseDto> AddDepartmentAsync(DeptCreateDto dept);
    Task<bool> UpdateDepartmentAsync(int id, DeptUpdateDto dept);
    Task<bool> DeleteDepartmentAsync(int id);
}
