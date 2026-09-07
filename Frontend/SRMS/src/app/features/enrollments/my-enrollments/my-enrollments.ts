import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EnrollmentService } from '../services/enrollment.service';
import { EnrollmentWithDetailsDto } from '../models/enrollment.model';
import { CourseService } from '../../courses/services/course.service';
import { CourseResponseDto } from '../../courses/models/course.model';
import { AcademicTermService } from '../../academic-terms/services/academic-term.service';
import { AcademicTermResponseDto } from '../../academic-terms/models/academic-term.model';
import { ToastService } from '@shared/services/toast.service';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner';
import { TableComponent, TableColumn } from '@shared/components/table/table';

/**
 * My Enrollments Component
 * ------------------------
 * Displays the currently authenticated student's course enrollments.
 * Uses switchMap in EnrollmentService to chain: get student ID, then fetch enrollments.
 * Enriches data with course and term details for display.
 * Supports grouping/sorting by academic term.
 */
@Component({
  selector: 'app-my-enrollments',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
    TableComponent
  ],
  templateUrl: './my-enrollments.html'
})
export class MyEnrollmentsComponent implements OnInit {
  private enrollmentService = inject(EnrollmentService);
  private courseService = inject(CourseService);
  private termService = inject(AcademicTermService);
  private toast = inject(ToastService);

  enrollments = signal<EnrollmentWithDetailsDto[]>([]);
  courses = signal<CourseResponseDto[]>([]);
  terms = signal<AcademicTermResponseDto[]>([]);
  isLoading = signal(true);

  // Table sorting state
  sortField = signal('termNumber');
  sortDirection = signal<'asc' | 'desc'>('asc');

  // Table column definitions
  tableColumns: TableColumn[] = [
    { key: 'courseCode', header: 'Course Code', sortable: true, align: 'left' },
    { key: 'courseTitle', header: 'Course Title', sortable: true, align: 'left' },
    { key: 'creditHours', header: 'Credit Hours', sortable: true, align: 'center' },
    { key: 'termName', header: 'Academic Term', sortable: true, align: 'left' },
    { key: 'termNumber', header: 'Term', sortable: true, align: 'center' }
  ];

  // Computed: sorted enrollments
  sortedEnrollments = computed(() => {
    let result = [...this.enrollments()];

    const field = this.sortField();
    const dir = this.sortDirection();

    result.sort((a: any, b: any) => {
      const valA = a[field];
      const valB = b[field];

      if (!isNaN(Number(valA)) && !isNaN(Number(valB))) {
        return dir === 'asc' ? Number(valA) - Number(valB) : Number(valB) - Number(valA);
      }

      return dir === 'asc'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });

    return result;
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);

    // Load reference data (courses and terms) in parallel
    this.courseService.getAll().subscribe({
      next: (courses) => {
        this.courses.set(courses);
        this.loadTermsAndEnrollments();
      },
      error: () => {
        this.toast.error('Failed to load courses.');
        this.isLoading.set(false);
      }
    });
  }

  private loadTermsAndEnrollments(): void {
    this.termService.getAll().subscribe({
      next: (terms) => {
        this.terms.set(terms);
        this.loadEnrollments();
      },
      error: (error) => {
        console.log(error);
        this.toast.error('Failed to load academic terms.');
        this.loadEnrollments(); // Try loading enrollments even if terms fail
      }
    });
  }

  private loadEnrollments(): void {
    console.log("hello world");
    this.enrollmentService.getMyEnrollments().subscribe({
      next: (rawEnrollments) => {
        // Enrich with course and term details
        const enriched = this.enrollmentService.enrichWithDetails(
          rawEnrollments,
          this.courses(),
          this.terms()
        );
        this.enrollments.set(enriched);
        this.isLoading.set(false);
      },
      error: (error) => {
        if (error.status === 404) {
          this.enrollments.set([]);
        } else {
          console.log(error);
          this.toast.error('Failed to load your enrollments. Please try again.');

        }
        this.isLoading.set(false);
      }
    });
  }

  onSortChange(event: { field: string; direction: 'asc' | 'desc' }): void {
    this.sortField.set(event.field);
    this.sortDirection.set(event.direction);
  }
}
