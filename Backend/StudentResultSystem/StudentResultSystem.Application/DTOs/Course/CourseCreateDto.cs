public class CourseCreateDto
{
    public string Title { get; set; } = null!;
    public string Code { get; set; } = null!;
    public int CreditHours { get; set; }
    public string TermNumber { get; set; }
    public int DepartmentId { get; set; }
}