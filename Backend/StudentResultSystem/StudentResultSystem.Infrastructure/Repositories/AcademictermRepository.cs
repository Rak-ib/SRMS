using Microsoft.EntityFrameworkCore;
using StudentResultSystem.Application.Interfaces;
using StudentResultSystem.Domain.Entities;
using StudentResultSystem.Infrastructure.Persistence;

namespace StudentResultSystem.Infrastructure.Repositories;

public class AcademictermRepository : GenericRepository<Academicterm>, IAcademicTermRepository
{
    public AcademictermRepository(AppDbContext context) : base(context)
    {
    }
    public async Task<int> GetTotalEnrollment(int academicTermId)
    {
        return await _context.Enrollments.CountAsync(e => e.AcademicTermId == academicTermId);
    }
    public async Task<int?> GetTermId(string termName, string termNumber)
    {
        var term = await _context.Academicterms
            .FirstOrDefaultAsync(t => t.TermName == termName && t.TermNumber == termNumber);
        if (term == null)
        {
            throw new InvalidOperationException($"Academic term with name '{termName}' and number '{termNumber}' not found.");
        }
        return term.Id;
    }
}
