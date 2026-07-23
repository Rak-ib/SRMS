using Microsoft.EntityFrameworkCore;
using StudentResultSystem.Application.Interfaces;
using StudentResultSystem.Domain.Entities;
using StudentResultSystem.Infrastructure.Persistence;


namespace StudentResultSystem.Infrastructure.Repositories;

public class DeptRepository : GenericRepository<Department>,IDeptRepository
{
    
    public DeptRepository(AppDbContext context): base(context)
    {
    }
    
    public async Task<bool> GetByNameAsync(string name)
    {
        Department? department = await _context.Departments.FirstOrDefaultAsync(d => d.DeptName == name);
        return department != null;
    }
        
}
