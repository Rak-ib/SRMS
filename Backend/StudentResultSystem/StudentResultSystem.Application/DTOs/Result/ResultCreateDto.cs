public class ResultCreateDto
{
    public int EnrollmentId { get; set; }
    public decimal? GradePoint { get; set; }
    public string LetterGrade { get; set; } = null!;
    public DateTime? PublishedAt { get; set; }
}