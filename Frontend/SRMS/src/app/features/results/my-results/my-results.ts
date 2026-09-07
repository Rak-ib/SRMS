import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResultService } from '../services/result.service';
import { ResultWithDetailsDto } from '../models/result.model';
import { ToastService } from '@shared/services/toast.service';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner';
import { TableComponent, TableColumn } from '@shared/components/table/table';

/**
 * My Results Component
 * -------------------
 * Displays the currently authenticated student's academic results and CGPA.
 * Uses switchMap in ResultService to chain: get student ID, then fetch results and CGPA in parallel via forkJoin.
 * Prominently displays CGPA as a stat card, followed by results in a table.
 * Handles null grade points gracefully (shows "Pending") and empty states.
 */
@Component({
  selector: 'app-my-results',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
    TableComponent
  ],
  templateUrl: './my-results.html'
})
export class MyResultsComponent implements OnInit {
  private resultService = inject(ResultService);
  private toast = inject(ToastService);

  results = signal<ResultWithDetailsDto[]>([]);
  cgpa = signal<number>(0);
  isLoading = signal(true);
  hasError = signal(false);

  // Table sorting state
  sortField = signal('termNumber');
  sortDirection = signal<'asc' | 'desc'>('asc');

  // Table column definitions
  tableColumns: TableColumn[] = [
    { key: 'courseCode', header: 'Course Code', sortable: true, align: 'left' },
    { key: 'courseTitle', header: 'Course Title', sortable: true, align: 'left' },
    { key: 'creditHours', header: 'Credit Hours', sortable: true, align: 'center' },
    { key: 'termName', header: 'Academic Term', sortable: true, align: 'left' },
    { key: 'termNumber', header: 'Term', sortable: true, align: 'center' },
    { key: 'gradePointDisplay', header: 'Grade Point', sortable: false, align: 'center' },
    { key: 'letterGradeDisplay', header: 'Letter Grade', sortable: false, align: 'center' }
  ];

  // Computed: sorted results with display formatting
  sortedResults = computed(() => {
    let result = [...this.results()];

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

    // Add display properties for table rendering
    return result.map(r => ({
      ...r,
      gradePointDisplay: this.getGradePointDisplay(r.gradePoint),
      letterGradeDisplay: this.getLetterGradeDisplay(r.letterGrade)
    })) as ResultWithDetailsDto[];
  });

  // Computed: CGPA display value (formatted)
  formattedCgpa = computed(() => {
    return this.cgpa().toFixed(2);
  });

  // Computed: CGPA color based on value
  cgpaColor = computed(() => {
    const value = this.cgpa();
    if (value >= 3.5) return 'text-green-400';
    if (value >= 3.0) return 'text-blue-400';
    if (value >= 2.5) return 'text-yellow-400';
    if (value >= 2.0) return 'text-orange-400';
    return 'text-red-400';
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.resultService.getMyResults().subscribe({
      next: (data) => {
        // Enrich results with enrollment details
        const enriched = this.resultService.enrichWithDetails(
          data.results,
          data.enrollments
        );
        this.results.set(enriched);
        this.cgpa.set(data.cgpa);
        this.isLoading.set(false);
      },
      error: (error) => {
        if (error.status === 404) {
          this.results.set([]);
          this.cgpa.set(0);
          this.toast.info('No results found yet.');
        } else {
          console.log(error);
          this.toast.error('Failed to load your results. Please try again.');
          this.hasError.set(true);
        }
        this.isLoading.set(false);
      }
    });
  }

  // Helper to display grade point or "Pending"
  getGradePointDisplay(gradePoint: number | null): string {
    return gradePoint !== null ? gradePoint.toFixed(2) : 'Pending';
  }

  // Helper to display letter grade or "Pending"
  getLetterGradeDisplay(letterGrade: string | null): string {
    return letterGrade || 'Pending';
  }

  onSortChange(event: { field: string; direction: 'asc' | 'desc' }): void {
    this.sortField.set(event.field);
    this.sortDirection.set(event.direction);
  }
}