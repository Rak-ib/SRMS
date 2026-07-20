namespace StudentResultSystem.Application.DTOs.Student;

public class StudentUpdateDto
{
    public string StudentName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string BatchYear { get; set; } = null!;
    public int DepartmentId { get; set; }
}