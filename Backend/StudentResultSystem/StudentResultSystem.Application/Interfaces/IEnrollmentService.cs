using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentResultSystem.Application.Interfaces;

public interface IEnrollmentService
{
    Task<EnrollmentResponseDto> GetEnrollmentByIdAsync(int id);
    Task<IEnumerable<EnrollmentResponseDto>> GetAllEnrollmentsAsync();
    Task<IEnumerable<EnrollmentResponseDto>> GetEnrollmentsByStudentIdAsync(int studentId);
    Task<IEnumerable<EnrollmentResponseDto>> GetEnrollmentsByCourseIdAsync(int courseId);
    Task<IEnumerable<EnrollmentResponseDto>> GetEnrollmentsByAcademicTermIdAsync(int academicTermId);
    Task<EnrollmentResponseDto> CreateEnrollmentAsync(EnrollmentCreateDto dto);
    Task<bool> UpdateEnrollmentAsync(int id, EnrollmentUpdateDto dto);
    Task<bool> DeleteEnrollmentAsync(int id);   
}
