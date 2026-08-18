using StudentResultSystem.Application.DTOs.Student;
using StudentResultSystem.Application.Interfaces;
using StudentResultSystem.Domain.Entities;

namespace StudentResultSystem.Application.Services;

public class StudentService : IStudentService
{
    private readonly IStudentRepository _studentRepository;

    public StudentService(IStudentRepository studentRepository)
    {
        _studentRepository = studentRepository;
    }

    public async Task<StudentResponseDto> GetMyProfileAsync(int userId)
    {
        
        var student = await _studentRepository.GetMyProfileAsync(userId);
        return MapToResponseDto(student);
    }   

    public async Task<StudentResponseDto?> GetByIdAsync(int id)
    {
        var student = await _studentRepository.GetByIdAsync(id);
        if (student == null) return null;

        return MapToResponseDto(student);
    }

    public async Task<IEnumerable<StudentResponseDto>> GetAllAsync()
    {
        var students = await _studentRepository.GetAllAsync();
        return students.Select(MapToResponseDto);
    }

    public async Task<IEnumerable<StudentResponseDto>> GetByDepartmentAsync(int departmentId)
    {
        var students = await _studentRepository.GetByDepartmentAsync(departmentId);
        return students.Select(MapToResponseDto);
    }

    public async Task<StudentResponseDto> CreateAsync(StudentCreateDto dto)
    {
        var exists = await _studentRepository.ExistsAsync(dto.Id);
        if (exists)
            throw new InvalidOperationException($"Student with Id {dto.Id} already exists.");

        var student = new Student
        {
            Id = dto.Id,
            StudentName = dto.StudentName,
            RegNo = dto.RegNo,
            Email = dto.Email,
            BatchYear = dto.BatchYear,
            DepartmentId = dto.DepartmentId,
            UserId = dto.UserId
        };

        await _studentRepository.AddAsync(student);
        await _studentRepository.SaveChangesAsync();

        return MapToResponseDto(student);
    }

    public async Task<bool> UpdateAsync(int id, StudentUpdateDto dto)
    {
        var student = await _studentRepository.GetByIdAsync(id);
        if (student == null) return false;

        student.StudentName = dto.StudentName;
        student.Email = dto.Email;
        student.BatchYear = dto.BatchYear;
        student.DepartmentId = dto.DepartmentId;

        _studentRepository.Update(student);
        await _studentRepository.SaveChangesAsync();

        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var student = await _studentRepository.GetByIdAsync(id);
        if (student == null) return false;

        _studentRepository.Delete(student);
        await _studentRepository.SaveChangesAsync();

        return true;
    }

    private static StudentResponseDto MapToResponseDto(Student student) => new()
    {
        Id = student.Id,
        StudentName = student.StudentName,
        RegNo = student.RegNo,
        Email = student.Email,
        BatchYear = student.BatchYear,
        DepartmentId = student.DepartmentId,
        UserId = student.UserId
    };
}