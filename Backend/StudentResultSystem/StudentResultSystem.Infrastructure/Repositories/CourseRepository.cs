using Microsoft.EntityFrameworkCore;
using StudentResultSystem.Application.Interfaces;
using StudentResultSystem.Domain.Entities;
using StudentResultSystem.Infrastructure.Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentResultSystem.Infrastructure.Repositories;

public class CourseRepository : GenericRepository<Course>, ICourseRepository
{
    public CourseRepository(AppDbContext context) : base(context)
    {
    }
    public async Task<IEnumerable<Course>> GetByDepartmentAsync(int departmentId)
    {
        return await _context.Courses.Where(c => c.DepartmentId == departmentId).ToListAsync();
    }

    public async Task<bool>GetByCourseCode(string courseCode)
    {
        var exist= await _context.Courses.Where(c=> c.Code == courseCode).ToListAsync();
        return exist.Any();
        
    }
}
