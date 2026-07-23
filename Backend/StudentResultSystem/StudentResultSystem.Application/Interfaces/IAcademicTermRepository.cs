using StudentResultSystem.Domain.Entities;

namespace StudentResultSystem.Application.Interfaces;

public interface IAcademicTermRepository: IGenericRepository<Academicterm>
{
    Task<int> GetTotalEnrollment(int academicTermId);

    Task<int?> GetTermId(string termName, string termNumber);
}
