using StudentResultSystem.Domain.Entities;
using System;


namespace StudentResultSystem.Application.Interfaces;

public interface IStudentRepository : IGenericRepository<Student>
{
    Task<IEnumerable<Student>> GetByDepartmentAsync(int departmentId);

    Task<Student> GetMyProfileAsync(int userId);
}
