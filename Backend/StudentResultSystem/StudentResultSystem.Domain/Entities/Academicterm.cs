using System;
using System.Collections.Generic;

namespace StudentResultSystem.Domain.Entities;

public partial class Academicterm
{
    public int Id { get; set; }

    public string TermName { get; set; } = null!;

    public string TermNumber { get; set; } = null!;

    public DateOnly StartDate { get; set; }

    public DateOnly EndDate { get; set; }

    public virtual ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
}
