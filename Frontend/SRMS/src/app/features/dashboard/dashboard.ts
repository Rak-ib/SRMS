import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { StudentService } from '../students/services/student.service';
import { DepartmentService } from '../departments/services/department.service';
import { ToastService } from '@shared/services/toast.service';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner';
import { StudentResponseDto } from '../students/models/student.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent],
  templateUrl: './dashboard.html'
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private studentService = inject(StudentService);
  private deptService = inject(DepartmentService);
  private toast = inject(ToastService);

  // ── Auth state (from signals — no HTTP call needed) ───────────────────────
  user = this.authService.currentUser;
  userName = computed(() => this.user()?.name ?? 'User');
  userRole = computed(() => this.user()?.role ?? '');
  isStudent = computed(() => this.userRole() === 'Student');

  // ── Student-specific state ─────────────────────────────────────────────────
  isLoadingProfile = signal(false);
  studentProfile = signal<StudentResponseDto | null>(null);

  // Maps departmentId → "Name (Code)" for display
  private deptMap = signal<Map<number, string>>(new Map());
  deptDisplay = computed(() => {
    const profile = this.studentProfile();
    if (!profile) return '—';
    return this.deptMap().get(profile.departmentId) ?? `Dept ID: ${profile.departmentId}`;
  });

  ngOnInit(): void {
    // Only students need an API fetch on dashboard load.
    // Admin/Teacher dashboard is fully static for now.
    if (this.isStudent()) {
      this.loadStudentProfile();
    }
  }

  private loadStudentProfile(): void {
    this.isLoadingProfile.set(true);

    // Load departments first so we can resolve the name, then fetch own profile.
    // Both are lightweight calls so sequential is acceptable here.
    this.deptService.getAll().subscribe({
      next: (depts) => {
        const map = new Map<number, string>();
        depts.forEach(d => map.set(d.id, `${d.name} (${d.code})`));
        this.deptMap.set(map);
        this.fetchOwnProfile();
      },
      error: () => {
        // Non-critical — profile will still load, just without a dept name
        this.fetchOwnProfile();
      }
    });
  }

  private fetchOwnProfile(): void {
    this.studentService.getMyProfile().subscribe({
      next: (profile) => {
        this.studentProfile.set(profile);
        this.isLoadingProfile.set(false);
      },
      error: () => {
        this.isLoadingProfile.set(false);
        this.toast.error('Could not load your student profile. Please try again later.');
      }
    });
  }
}
