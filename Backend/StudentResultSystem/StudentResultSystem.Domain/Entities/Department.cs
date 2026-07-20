using System;
using System.Collections.Generic;

namespace StudentResultSystem.Domain.Entities;

public partial class Department
{
    public int Id { get; set; }

    public string DeptName { get; set; } = null!;

    public string Code { get; set; } = null!;

    public virtual ICollection<Course> Courses { get; set; } = new List<Course>();

    public virtual ICollection<Student> Students { get; set; } = new List<Student>();
}
