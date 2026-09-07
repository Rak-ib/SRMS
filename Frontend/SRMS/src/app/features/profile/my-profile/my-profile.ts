import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentService } from '../../students/services/student.service';
import { StudentResponseDto } from '../../students/models/student.model';
import { ToastService } from '@shared/services/toast.service';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner';
import { DepartmentService, DeptResponseDto } from '../../departments/services/department.service';

/**
 * My Profile Component
 * --------------------
 * Displays the currently authenticated student's profile information.
 * Read-only view - only Admin/Teacher can update student records.
 * Handles 404 case when no student record is linked to the account.
 */
@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './my-profile.html'
})
export class MyProfileComponent implements OnInit {
  private studentService = inject(StudentService);
  private deptService = inject(DepartmentService);
  private toast = inject(ToastService);

  student = signal<StudentResponseDto | null>(null);
  department = signal<DeptResponseDto | null>(null);
  isLoading = signal(true);
  hasError = signal(false);

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.studentService.getMyProfile().subscribe({
      next: (data) => {
        this.student.set(data);
        this.loadDepartment(data.departmentId);
      },
      error: (error) => {
        if (error.status === 404) {
          this.toast.error('No student record linked to this account.');
        } else {
          this.toast.error('Failed to load profile. Please try again.');
        }
        this.hasError.set(true);
        this.isLoading.set(false);
      }
    });
  }

  private loadDepartment(departmentId: number): void {
    this.deptService.getAll().subscribe({
      next: (departments) => {
        const dept = departments.find(d => d.id === departmentId);
        this.department.set(dept || null);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }
}
