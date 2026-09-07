using StudentResultSystem.Domain.Entities;

namespace StudentResultSystem.Application.Interfaces;

public interface IResultRepository: IGenericRepository<Result>
{
    Task<Result?> GetByEnrollmentIdAsync(int enrollmentId);

    Task<IEnumerable<StudentResultDto>> GetByStudentIdAsync(int studentId);

}
