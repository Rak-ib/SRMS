using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentResultSystem.Application.Interfaces;

namespace StudentResultSystem.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DepartmentController : ControllerBase
{
    private readonly IDeptService _departmentService;
    public DepartmentController(IDeptService deptService)
    {
        _departmentService = deptService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<DeptResponseDto>>> GetAll()
    {
        var departments = await _departmentService.GetAllDepartmentsAsync();
        return Ok(departments);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<DeptResponseDto>> GetById(int id)
    {
        var department = await _departmentService.GetDepartmentByIdAsync(id);
        if (department == null)
            return NotFound($"Department with Id {id} not found.");
        return Ok(department);
    }

    [HttpPost]
    public async Task<ActionResult<DeptResponseDto>> Create(DeptCreateDto dto)
    {
        var created = await _departmentService.AddDepartmentAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _departmentService.DeleteDepartmentAsync(id);
        if (!result)
            return NotFound($"Department with Id {id} not found.");
        return NoContent();
    }

    [HttpPatch]
    [Route("{id:int}")]
    public async Task<IActionResult> Update(int id, DeptUpdateDto dto)
    {
        var result = await _departmentService.UpdateDepartmentAsync(id, dto);
        if (!result)
            return NotFound($"Department with Id {id} not found.");
        return NoContent();
    }
}
