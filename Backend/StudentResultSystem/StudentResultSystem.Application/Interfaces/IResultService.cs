


namespace StudentResultSystem.Application.Interfaces;

public interface IResultService
{
    Task<IEnumerable<ResultResponseDto>> GetAllResultsAsync();
    Task<ResultResponseDto> GetByEnrollmentIdAsync(int enrollmentId);
    Task<ResultResponseDto> AddResultAsync(ResultCreateDto dto);
    Task<bool> UpdateResultAsync(int enrollmentId, ResultUpdateDto dto);
    Task<bool> DeleteResultAsync(int enrollmentId);
    
}
