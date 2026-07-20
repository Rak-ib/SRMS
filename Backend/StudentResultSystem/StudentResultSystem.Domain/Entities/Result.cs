using System;
using System.Collections.Generic;

namespace StudentResultSystem.Domain.Entities;

public partial class Result
{
    public int Id { get; set; }

    public int EnrollmentId { get; set; }

    public decimal? GradePoint { get; set; }

    public string LetterGrade { get; set; } = null!;

    public DateTime? PublishedAt { get; set; }

    public virtual Enrollment Enrollment { get; set; } = null!;
}
