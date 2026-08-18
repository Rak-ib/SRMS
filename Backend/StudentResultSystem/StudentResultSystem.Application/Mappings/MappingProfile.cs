using AutoMapper;
using StudentResultSystem.Domain.Entities;
// add your DTO namespace usings here

namespace StudentResultSystem.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // Enrollment mappings
        CreateMap<Enrollment, EnrollmentResponseDto>();
        CreateMap<EnrollmentCreateDto, Enrollment>();
        CreateMap<EnrollmentUpdateDto, Enrollment>();

        // Result mappings
        CreateMap<Result, ResultResponseDto>();
        CreateMap<ResultCreateDto, Result>();
        CreateMap<ResultUpdateDto, Result>();
    }
}