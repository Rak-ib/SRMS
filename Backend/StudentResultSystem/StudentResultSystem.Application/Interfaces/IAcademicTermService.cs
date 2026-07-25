using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentResultSystem.Application.Interfaces;

public interface IAcademicTermService
{
    Task<IEnumerable<AcademicTermResponseDto>> GetAllTermsAsync();
    Task<AcademicTermResponseDto> GetTermByIdAsync(int id);
    Task<int> GetTotalEnrollment(int academicTermId);
    Task<int?> GetTermId(string termName, string termNumber);
    Task<AcademicTermResponseDto> CreateTermAsync(AcademicTermCreateDto term);
    Task<bool> UpdateTermAsync(int id,AcademicTermUpdateDto term);
    Task<bool> DeleteTermAsync(int id);
}
