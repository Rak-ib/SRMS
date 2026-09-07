using Microsoft.EntityFrameworkCore;
using StudentResultSystem.Application.Interfaces;
using StudentResultSystem.Domain.Entities;
using StudentResultSystem.Infrastructure.Persistence;


namespace StudentResultSystem.Infrastructure.Repositories;

public class ResultRepository : GenericRepository<Result>, IResultRepository
{
    public ResultRepository(AppDbContext context) : base(context)
    {
    }
    public async Task<Result?> GetByEnrollmentIdAsync(int enrollmentId)
    {
        return await _context.Results.FirstOrDefaultAsync(r => r.EnrollmentId == enrollmentId);
    }

    public async Task<IEnumerable<StudentResultDto>> GetByStudentIdAsync(int studentId)
    {
        return await _context.Results
            .Where(r => r.Enrollment.StudentId == studentId)
            .Select(r => new StudentResultDto
            {
                CourseCode = r.Enrollment.Course.Code,
                CourseTitle = r.Enrollment.Course.Title,
                CreditHours = r.Enrollment.Course.CreditHours,
                GradePoint = r.GradePoint,
                LetterGrade = r.LetterGrade
            })
            .ToListAsync();
    }
}