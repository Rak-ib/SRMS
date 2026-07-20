namespace StudentResultSystem.Application.DTOs.Student;

public class StudentResponseDto
{
    public int Id { get; set; }
    public string StudentName { get; set; } = null!;
    public string RegNo { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string BatchYear { get; set; } = null!;
    public int DepartmentId { get; set; }
    public int? UserId { get; set; }
}