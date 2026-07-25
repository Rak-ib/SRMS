using AutoMapper;
using StudentResultSystem.Application.Interfaces;
using StudentResultSystem.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentResultSystem.Application.Services;

public class ResultService : IResultService
{
    private readonly IResultRepository _resultRepository;
    private readonly IMapper _mapper;
    public ResultService(IResultRepository resultRepository, IMapper mapper)
    {
        _resultRepository = resultRepository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<ResultResponseDto>> GetAllResultsAsync()
    {
        var results = await _resultRepository.GetAllAsync();
        return _mapper.Map<IEnumerable<ResultResponseDto>>(results);
    }

    public async Task<ResultResponseDto> AddResultAsync(ResultCreateDto dto)
    {
        var result = _mapper.Map<Result>(dto);
        if(result == null)
        {
            throw new ArgumentNullException(nameof(result), "Result cannot be null");
        }
        await _resultRepository.AddAsync(result);
        await _resultRepository.SaveChangesAsync();
        return _mapper.Map<ResultResponseDto>(result);
    }

    public async Task<bool> UpdateResultAsync(int id, ResultUpdateDto dto)
    {
        var result = await _resultRepository.GetByIdAsync(id);
        if (result == null)
        {
            throw new KeyNotFoundException($"Result with id {id} not found.");
        }
        _mapper.Map(dto, result);
        _resultRepository.Update(result);
        await _resultRepository.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteResultAsync(int id)
    {
        var result = await _resultRepository.GetByIdAsync(id);
        if (result == null)
        {
            throw new KeyNotFoundException($"Result with id {id} not found.");
        }
        _resultRepository.Delete(result);
        await _resultRepository.SaveChangesAsync();
        return true;
    }

    public async Task<ResultResponseDto> GetByEnrollmentIdAsync(int enrollmentId)
    {
        var result = await _resultRepository.GetByEnrollmentIdAsync(enrollmentId);
        if(result == null)
        {
            throw new KeyNotFoundException($"Result with enrollment id {enrollmentId} not found.");
        }
        return _mapper.Map<ResultResponseDto>(result);
    }
}
