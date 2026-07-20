namespace StudentResultSystem.Application.DTOs.Student;

public class StudentCreateDto
{
    public int Id { get; set; }              // self-assigned, remember?
    public string StudentName { get; set; } = null!;
    public string RegNo { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string BatchYear { get; set; } = null!;
    public int DepartmentId { get; set; }
    public int? UserId { get; set; }
}