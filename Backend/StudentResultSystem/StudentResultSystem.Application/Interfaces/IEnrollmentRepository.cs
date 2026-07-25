using StudentResultSystem.Domain.Entities;

namespace StudentResultSystem.Application.Interfaces;

public interface IEnrollmentRepository: IGenericRepository<Enrollment>
{
    Task<IEnumerable<Enrollment>> GetEnrollmentsByStudentIdAsync(int studentId);

    Task<IEnumerable<Enrollment>> GetEnrollmentsByCourseIdAsync(int courseId);

    Task<IEnumerable<Enrollment>> GetEnrollmentsByAcademicTermIdAsync(int academicTermId);
}
