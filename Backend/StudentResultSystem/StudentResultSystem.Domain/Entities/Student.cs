using System;
using System.Collections.Generic;

namespace StudentResultSystem.Domain.Entities;

public partial class Student
{
    public int Id { get; set; }

    public string StudentName { get; set; } = null!;

    public string RegNo { get; set; } = null!;

    public string Email { get; set; } = null!;

    public int DepartmentId { get; set; }

    public string BatchYear { get; set; } = null!;

    public int? UserId { get; set; }

    public virtual Department Department { get; set; } = null!;

    public virtual ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();

    public virtual User User { get; set; } = null!;
}
