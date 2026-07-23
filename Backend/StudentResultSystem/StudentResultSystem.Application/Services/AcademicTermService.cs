using StudentResultSystem.Application.Interfaces;
using StudentResultSystem.Domain.Entities;

namespace StudentResultSystem.Application.Services;

public class AcademicTermService : IAcademicTermService
{
    private readonly IAcademicTermRepository _academicTermRepository;
    public AcademicTermService(IAcademicTermRepository academicTermRepository)
    {
        _academicTermRepository = academicTermRepository;
    }
    public async Task<IEnumerable<AcademicTermResponseDto>> GetAllTermsAsync()
    {
        var terms = await _academicTermRepository.GetAllAsync();
        return terms.Select(t => new AcademicTermResponseDto
        {
            Id = t.Id,
            TermName = t.TermName,
            TermNumber = t.TermNumber,
            StartDate = t.StartDate.ToDateTime(TimeOnly.MinValue),
            EndDate = t.EndDate.ToDateTime(TimeOnly.MinValue)
        });
    }
    public async Task<AcademicTermResponseDto> GetTermByIdAsync(int id)
    {
        var term = await _academicTermRepository.GetByIdAsync(id);
        if (term == null)
        {
            throw new KeyNotFoundException($"Academic term with ID {id} not found.");
        }
        return new AcademicTermResponseDto
        {
            Id = term.Id,
            TermName = term.TermName,
            TermNumber = term.TermNumber,
            StartDate = term.StartDate.ToDateTime(TimeOnly.MinValue),
            EndDate = term.EndDate.ToDateTime(TimeOnly.MinValue)
        };
    }

    public async Task<int> GetTotalEnrollment(int academicTermId)
    {
        return await _academicTermRepository.GetTotalEnrollment(academicTermId);
    }

    public async Task<int?> GetTermId(string termName, string termNumber)
    {
        return await _academicTermRepository.GetTermId(termName, termNumber);
    }

    public async Task<AcademicTermResponseDto> CreateTermAsync(AcademicTermCreateDto term)
    {
        int? existingTermId = await _academicTermRepository.GetTermId(term.TermName, term.TermNumber);
        if (existingTermId!=null)
        {
            throw new InvalidOperationException($"Academic term with name '{term.TermName}' and number '{term.TermNumber}' already exists.");
        }
        var newTerm = new Academicterm
        {
            TermName = term.TermName,
            TermNumber = term.TermNumber,
            StartDate = DateOnly.FromDateTime(term.StartDate),
            EndDate = DateOnly.FromDateTime(term.EndDate)
        };
        await _academicTermRepository.AddAsync(newTerm);
        await _academicTermRepository.SaveChangesAsync();

        return new AcademicTermResponseDto
        {
            Id = newTerm.Id,
            TermName = newTerm.TermName,
            TermNumber = newTerm.TermNumber,
            StartDate = newTerm.StartDate.ToDateTime(TimeOnly.MinValue),
            EndDate = newTerm.EndDate.ToDateTime(TimeOnly.MinValue)
        };
    }

    public async Task<bool> UpdateTermAsync(AcademicTermUpdateDto term)
    {
        var existingTerm = await _academicTermRepository.GetByIdAsync(term.Id);
        if (existingTerm == null)
        {
            throw new KeyNotFoundException($"Academic term with ID {term.Id} not found.");
        }
        existingTerm.TermName = term.TermName;
        existingTerm.TermNumber = term.TermNumber;
        existingTerm.StartDate = DateOnly.FromDateTime(term.StartDate);
        existingTerm.EndDate = DateOnly.FromDateTime(term.EndDate);
        _academicTermRepository.Update(existingTerm);
        await _academicTermRepository.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteTermAsync(int id)
    {
        var existingTerm = await _academicTermRepository.GetByIdAsync(id);
        if (existingTerm == null)
        {
            throw new KeyNotFoundException($"Academic term with ID {id} not found.");
        }
        _academicTermRepository.Delete(existingTerm);
        await _academicTermRepository.SaveChangesAsync();
        return true;
    }
}
