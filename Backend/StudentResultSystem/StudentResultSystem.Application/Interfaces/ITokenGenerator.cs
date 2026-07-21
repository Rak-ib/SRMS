using StudentResultSystem.Domain.Entities;

namespace StudentResultSystem.Application.Interfaces;

public interface ITokenGenerator
{
    string GenerateToken(User user);
}