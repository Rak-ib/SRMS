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
}
