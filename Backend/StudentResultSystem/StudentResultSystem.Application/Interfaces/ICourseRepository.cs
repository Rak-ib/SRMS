using StudentResultSystem.Domain.Entities;
namespace StudentResultSystem.Application.Interfaces;

public interface ICourseRepository : IGenericRepository<Course>
{
    Task<IEnumerable<Course>> GetByDepartmentAsync(int departmentId);

    Task<bool> GetByCourseCode(string courseCode);
}