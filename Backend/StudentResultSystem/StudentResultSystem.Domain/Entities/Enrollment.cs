using System;
using System.Collections.Generic;

namespace StudentResultSystem.Domain.Entities;

public partial class Enrollment
{
    public int Id { get; set; }

    public int AcademicTermId { get; set; }

    public int StudentId { get; set; }

    public int CourseId { get; set; }

    public virtual Academicterm AcademicTerm { get; set; } = null!;

    public virtual Course Course { get; set; } = null!;

    public virtual Result? Result { get; set; }

    public virtual Student Student { get; set; } = null!;
}
