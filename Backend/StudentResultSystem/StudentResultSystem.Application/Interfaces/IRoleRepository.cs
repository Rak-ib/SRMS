using StudentResultSystem.Domain.Entities;

namespace StudentResultSystem.Application.Interfaces;

public interface IRoleRepository 
{
    Task<Role?> GetByNameAsync(string name);
}
