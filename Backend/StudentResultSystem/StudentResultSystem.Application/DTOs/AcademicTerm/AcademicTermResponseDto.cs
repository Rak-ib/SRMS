public class AcademicTermResponseDto
{
    public int Id { get; set; }
    public string TermName { get; set; } = null!;
    public string TermNumber { get; set; } = null!;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
}