using StudentResultSystem.Domain.Entities;


namespace StudentResultSystem.Application.Interfaces;

public interface IDeptRepository : IGenericRepository<Department>
{
    Task<bool> GetByNameAsync(string name);
    
}
