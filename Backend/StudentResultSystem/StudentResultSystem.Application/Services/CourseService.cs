using StudentResultSystem.Application.Interfaces;
using StudentResultSystem.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentResultSystem.Application.Services;

public class CourseService : ICourseService
{
    private readonly ICourseRepository _courseRepository;
    public CourseService(ICourseRepository courseRepository)
    {
        _courseRepository = courseRepository;
    }
    public async Task<IEnumerable<CourseResponseDto>> GetAllCoursesAsync()
    {
        var courses = await _courseRepository.GetAllAsync();
        return courses.Select(c => new CourseResponseDto
        {
            Id = c.Id,
            Title = c.Title,
            Code = c.Code,
            CreditHours = c.CreditHours,
            TermNumber = c.TermNumber,
            DepartmentId = c.DepartmentId
        });
    }

    public async Task<CourseResponseDto> GetCourseByIdAsync(int id)
    {
        var course = await _courseRepository.GetByIdAsync(id);
        if (course == null)
        {
            throw new KeyNotFoundException($"Course with id {id} not found.");
        }
        return new CourseResponseDto
        {
            Id = course.Id,
            Title = course.Title,
            Code = course.Code,
            CreditHours = course.CreditHours,
            TermNumber = course.TermNumber,
            DepartmentId = course.DepartmentId
        };

    }

    public async Task<CourseResponseDto> CreateCourseAsync(CourseCreateDto courseCreateDto)
    {
        var course = new Course
        {
            Title = courseCreateDto.Title,
            Code = courseCreateDto.Code,
            CreditHours = courseCreateDto.CreditHours,
            TermNumber = courseCreateDto.TermNumber,
            DepartmentId = courseCreateDto.DepartmentId
        };
        await _courseRepository.AddAsync(course);
        await _courseRepository.SaveChangesAsync();
        return new CourseResponseDto
        {
            Id = course.Id,
            Title = course.Title,
            Code = course.Code,
            CreditHours = course.CreditHours,
            TermNumber = course.TermNumber,
            DepartmentId = course.DepartmentId
        };
    }

    public async Task<CourseResponseDto> UpdateCourseAsync(int id, CourseUpdateDto courseUpdateDto)
    {
        var course = await _courseRepository.GetByIdAsync(id);
        if (course == null)
        {
            throw new KeyNotFoundException($"Course with id {id} not found.");
        }
        course.Title = courseUpdateDto.Title;
        course.Code = courseUpdateDto.Code;
        course.CreditHours = courseUpdateDto.CreditHours;
        course.TermNumber = courseUpdateDto.TermNumber;
        course.DepartmentId = courseUpdateDto.DepartmentId;
        _courseRepository.Update(course);
        await _courseRepository.SaveChangesAsync();
        return new CourseResponseDto
        {
            Id = course.Id,
            Title = course.Title,
            Code = course.Code,
            CreditHours = course.CreditHours,
            TermNumber = course.TermNumber,
            DepartmentId = course.DepartmentId
        };
    }

    public async Task<bool> DeleteCourseAsync(int id)
    {
        var course = await _courseRepository.GetByIdAsync(id);
        if (course == null)
        {
            throw new KeyNotFoundException($"Course with id {id} not found.");
        }
        _courseRepository.Delete(course);
        await _courseRepository.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<CourseResponseDto>> GetCoursesByDepartmentAsync(int departmentId)
    {
        var courses = await _courseRepository.GetByDepartmentAsync(departmentId);
        return courses.Select(c => new CourseResponseDto
        {
            Id = c.Id,
            Title = c.Title,
            Code = c.Code,
            CreditHours = c.CreditHours,
            TermNumber = c.TermNumber,
            DepartmentId = c.DepartmentId
        });
    }

}

