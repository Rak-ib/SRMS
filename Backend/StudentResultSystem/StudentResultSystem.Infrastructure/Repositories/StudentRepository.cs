using Microsoft.EntityFrameworkCore;
using StudentResultSystem.Application.Interfaces;
using StudentResultSystem.Domain.Entities;
using StudentResultSystem.Infrastructure.Persistence;

namespace StudentResultSystem.Infrastructure.Repositories;

public class StudentRepository : GenericRepository<Student>, IStudentRepository
{
    public StudentRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Student>> GetByDepartmentAsync(int departmentId) =>
        await _context.Students
            .Where(s => s.DepartmentId == departmentId)
            .ToListAsync();

    public async Task<Student> GetMyProfileAsync(int userId)
    {
        return await _context.Students.Where(s => s.UserId == userId).FirstOrDefaultAsync() ?? throw new InvalidOperationException("No students found.");
    }
}