using StudentResultSystem.Application.DTOs.Student;
using StudentResultSystem.Application.Interfaces;
using StudentResultSystem.Domain.Entities;


namespace StudentResultSystem.Application.Services;

public class DeptService : IDeptService
{
    private readonly IDeptRepository _deptRepository;
    public DeptService(IDeptRepository deptRepository)
    {
        _deptRepository = deptRepository;
    }
    public async Task<IEnumerable<Department>> GetAllDepartmentsAsync()
    {
        return await _deptRepository.GetAllAsync();
    }
    public async Task<DeptResponseDto> GetDepartmentByIdAsync(int id)
    {
        var dept= await _deptRepository.GetByIdAsync(id);
        if (dept == null)
        {
            throw new KeyNotFoundException($"Department with ID '{id}' not found.");
        }
        return MapToResponseDto(dept);
    }
    public async Task<DeptResponseDto> AddDepartmentAsync(DeptCreateDto department)
    {
        var exist= await _deptRepository.GetByNameAsync(department.Name);
        if (exist)
        {
            throw new InvalidOperationException($"Department with name '{department.Name}' already exists.");
        }
        var newDepartment = new Department
        {
            DeptName = department.Name,
            Code = department.Code
        };
        await _deptRepository.AddAsync(newDepartment);
        await _deptRepository.SaveChangesAsync();
        return new DeptResponseDto
        {
            Id = newDepartment.Id,
            Name = newDepartment.DeptName,
            Code = newDepartment.Code
        };
    }
    public async Task<bool> UpdateDepartmentAsync(int id,DeptUpdateDto department)
    {
        var existingDepartment = await _deptRepository.GetByIdAsync(id);
        if(existingDepartment == null)
        {
            throw new KeyNotFoundException($"Department with ID '{id}' not found.");
        }
        existingDepartment.DeptName = department.Name;
        existingDepartment.Code = department.Code;

        _deptRepository.Update(existingDepartment);
        await _deptRepository.SaveChangesAsync();

        return true;
    }
    public async Task<bool> DeleteDepartmentAsync(int id)
    {
        bool exists = await _deptRepository.ExistsAsync(id);
        if (!exists)
        {
            throw new KeyNotFoundException($"Department with ID '{id}' not found.");
        }
        _deptRepository.Delete(await _deptRepository.GetByIdAsync(id));
        await _deptRepository.SaveChangesAsync();
        return true;
    }

    private static DeptResponseDto MapToResponseDto(Department dept) => new()
    {
        
        Name = dept.DeptName,
        Code = dept.Code
    };
}
