public class CourseResponseDto
{
    public int Id { get; set; }
    public string Title { get; set; } = null!;
    public string Code { get; set; } = null!;
    public int CreditHours { get; set; }
    public int TermNumber { get; set; }
    public int DepartmentId { get; set; }
}