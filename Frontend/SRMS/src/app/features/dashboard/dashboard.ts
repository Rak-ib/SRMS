import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { StudentService } from '../students/services/student.service';
import { DepartmentService } from '../departments/services/department.service';
import { DashboardService, DashboardSummaryDto } from './dashboard.service';
import { ToastService } from '@shared/services/toast.service';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner';
import { StudentResponseDto } from '../students/models/student.model';
import { DeptResponseDto } from '../departments/models/department.model';

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
  private dashboardService = inject(DashboardService);
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

  // ── Admin/Teacher dashboard state ───────────────────────────────────────────
  isLoadingSummary = signal(false);
  dashboardSummary = signal<DashboardSummaryDto | null>(null);

  ngOnInit(): void {
    if (this.isStudent()) {
      this.loadStudentProfile();
    } else {
      // Admin/Teacher: Load dashboard summary statistics
      this.loadDashboardSummary();
    }
  }

  private loadStudentProfile(): void {
    this.isLoadingProfile.set(true);

    // Load departments first so we can resolve the name, then fetch own profile.
    // Both are lightweight calls so sequential is acceptable here.
    this.deptService.getAll().subscribe({
      next: (depts: DeptResponseDto[]) => {
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

  private loadDashboardSummary(): void {
    this.isLoadingSummary.set(true);
    this.dashboardService.getSummary().subscribe({
      next: (summary) => {
        this.dashboardSummary.set(summary);
        this.isLoadingSummary.set(false);
        console.log('Dashboard summary loaded:', summary);
      },
      error: () => {
        this.isLoadingSummary.set(false);
        this.toast.error('Could not load dashboard statistics. Please try again later.');
      }
    });
  }
}
