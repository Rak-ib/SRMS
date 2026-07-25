using AutoMapper;
using StudentResultSystem.Application.Interfaces;
using StudentResultSystem.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentResultSystem.Application.Services;

public class EnrollmentService : IEnrollmentService
{
    private readonly IEnrollmentRepository _enrollmentRepository;
    private readonly IMapper _mapper;
    public EnrollmentService(IEnrollmentRepository enrollmentRepository, IMapper mapper)
    {
        _enrollmentRepository = enrollmentRepository;
        _mapper = mapper;
    }
    public async Task<EnrollmentResponseDto> GetEnrollmentByIdAsync(int id)
    {
        var enrollment = await _enrollmentRepository.GetByIdAsync(id);
        return _mapper.Map<EnrollmentResponseDto>(enrollment);
    }
    public async Task<IEnumerable<EnrollmentResponseDto>> GetAllEnrollmentsAsync()
    {
        var enrollments = await _enrollmentRepository.GetAllAsync();
        return _mapper.Map<IEnumerable<EnrollmentResponseDto>>(enrollments);
    }
    public async Task<IEnumerable<EnrollmentResponseDto>> GetEnrollmentsByStudentIdAsync(int studentId)
    {
        var enrollments = await _enrollmentRepository.GetEnrollmentsByStudentIdAsync(studentId);
        return _mapper.Map<IEnumerable<EnrollmentResponseDto>>(enrollments);
    }
    public async Task<IEnumerable<EnrollmentResponseDto>> GetEnrollmentsByCourseIdAsync(int courseId)
    {
        var enrollments = await _enrollmentRepository.GetEnrollmentsByCourseIdAsync(courseId);
        return _mapper.Map<IEnumerable<EnrollmentResponseDto>>(enrollments);
    }
    public async Task<IEnumerable<EnrollmentResponseDto>> GetEnrollmentsByAcademicTermIdAsync(int academicTermId)
    {
        var enrollments = await _enrollmentRepository.GetEnrollmentsByAcademicTermIdAsync(academicTermId);
        return _mapper.Map<IEnumerable<EnrollmentResponseDto>>(enrollments);
    }

    public async Task<EnrollmentResponseDto> CreateEnrollmentAsync(EnrollmentCreateDto dto)
    {
        var enrollment = _mapper.Map<Enrollment>(dto);
        if(enrollment == null)
        {
            throw new ArgumentNullException(nameof(enrollment), "Enrollment cannot be null");
        }
        await _enrollmentRepository.AddAsync(enrollment);
        await _enrollmentRepository.SaveChangesAsync();

        return _mapper.Map<EnrollmentResponseDto>(enrollment);
    }

    public async Task<bool> UpdateEnrollmentAsync(int id, EnrollmentUpdateDto dto)
    {
        var existingEnrollment = await _enrollmentRepository.GetByIdAsync(id);
        if (existingEnrollment == null||dto==null)
        {
            throw new KeyNotFoundException($"Enrollment with ID '{id}' not found.");
        }
        _mapper.Map(dto, existingEnrollment);
        _enrollmentRepository.Update(existingEnrollment);
        await _enrollmentRepository.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteEnrollmentAsync(int id)
    {
        var enrollment = await _enrollmentRepository.GetByIdAsync(id);
        if (enrollment == null)
        {
            throw new KeyNotFoundException($"Enrollment with ID '{id}' not found.");
        }
        _enrollmentRepository.Delete(enrollment);
        await _enrollmentRepository.SaveChangesAsync();
        return true;
    }
}
