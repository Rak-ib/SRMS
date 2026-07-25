using Microsoft.EntityFrameworkCore;
using StudentResultSystem.Application.Interfaces;
using StudentResultSystem.Domain.Entities;
using StudentResultSystem.Infrastructure.Persistence;

namespace StudentResultSystem.Infrastructure.Repositories;

public class EnrollmentRepository : GenericRepository<Enrollment>, IEnrollmentRepository
{
    public EnrollmentRepository(AppDbContext context) : base(context)
    {
    }
    public async Task<IEnumerable<Enrollment>> GetEnrollmentsByStudentIdAsync(int studentId)
    {
        return await _context.Enrollments
            .Where(e => e.StudentId == studentId)
            .ToListAsync();
    }
    public async Task<IEnumerable<Enrollment>> GetEnrollmentsByCourseIdAsync(int courseId)
    {
        return await _context.Enrollments
            .Where(e => e.CourseId == courseId)
            .ToListAsync();
    }
    public async Task<IEnumerable<Enrollment>> GetEnrollmentsByAcademicTermIdAsync(int academicTermId)
    {
        return await _context.Enrollments
            .Where(e => e.AcademicTermId == academicTermId)
            .ToListAsync();
    }
}
