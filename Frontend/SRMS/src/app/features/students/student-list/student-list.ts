import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { StudentService } from '../services/student.service';
import { StudentResponseDto } from '../models/student.model';
import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@shared/services/toast.service';
import { TableComponent, TableColumn } from '@shared/components/table/table';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner';
import { DepartmentService, DeptResponseDto } from '../../departments/services/department.service';
import { FormsModule } from '@angular/forms';

/**
 * REFERENCE PATTERN: StudentListComponent
 * --------------------------------------
 * Renders the table view list. Exposes search controls, filters, and modals.
 * Extensively documented to serve as a baseline model for other entity pages.
 */
@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    TableComponent,
    ConfirmDialogComponent,
    LoadingSpinnerComponent,
    FormsModule
  ],
  templateUrl: './student-list.html'
})
export class StudentListComponent implements OnInit {
  private studentService = inject(StudentService);
  private deptService = inject(DepartmentService);
  private authService = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);

  // Core Data Signals
  students = signal<StudentResponseDto[]>([]);
  departments = signal<DeptResponseDto[]>([]);
  isLoading = signal(false);

  // Search & Filtering State Signals
  searchQuery = signal('');
  selectedDepartmentId = signal<number | null>(null);
  
  // Table Pagination & Sorting Signals
  pageIndex = signal(0);
  pageSize = signal(10);
  sortField = signal('studentName');
  sortDirection = signal<'asc' | 'desc'>('asc');

  // Deletion Modal States
  isDeleteOpen = signal(false);
  isDeleting = signal(false);
  studentToDelete = signal<StudentResponseDto | null>(null);

  // Computed Permissions based on JWT active claims in AuthService
  canCreate = computed(() => {
    const role = this.authService.currentUser()?.role;
    return role === 'Admin' || role === 'Teacher';
  });
  canEdit = computed(() => this.canCreate());
  canDelete = computed(() => this.authService.currentUser()?.role === 'Admin');

  // Determine dynamic row actions to feed the generic table component
  tableActions = computed(() => {
    const actions = [];
    if (this.canEdit()) {
      actions.push({ label: 'Edit', name: 'edit' });
    }
    if (this.canDelete()) {
      actions.push({
        label: 'Delete',
        name: 'delete',
        class: 'rounded bg-red-600/10 border border-red-500/10 px-2 py-1 text-xs font-semibold text-red-400 hover:bg-red-600/20 active:bg-red-600/30 transition-all cursor-pointer'
      });
    }
    return actions;
  });

  // Table Column Definitions matching StudentResponseDto fields
  tableColumns: TableColumn[] = [
    { key: 'id', header: 'Student ID', sortable: true, align: 'left' },
    { key: 'studentName', header: 'Name', sortable: true, align: 'left' },
    { key: 'regNo', header: 'Registration No', sortable: true, align: 'left' },
    { key: 'email', header: 'Email', sortable: true, align: 'left' },
    { key: 'batchYear', header: 'Batch', sortable: true, align: 'center' },
    { key: 'deptName', header: 'Department', sortable: true, align: 'left' }
  ];

  // Helper map to quickly translate Department ID to Code/Name strings
  private departmentMap = computed(() => {
    const map = new Map<number, string>();
    for (const d of this.departments()) {
      map.set(d.id, `${d.name} (${d.code})`);
    }
    return map;
  });

  // Filter and sort computation. Runs locally since backend controller endpoints return raw lists.
  filteredStudents = computed(() => {
    // Append human-readable department names to raw records
    let result = this.students().map(s => ({
      ...s,
      deptName: this.departmentMap().get(s.departmentId) || `ID: ${s.departmentId}`
    }));

    // Filter 1: Search Query matching Name, RegNo, or Email
    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      result = result.filter(
        s => s.studentName.toLowerCase().includes(query) || 
             s.regNo.toLowerCase().includes(query) ||
             s.email.toLowerCase().includes(query)
      );
    }

    // Filter 2: Department Selection Filter
    const deptId = this.selectedDepartmentId();
    if (deptId !== null) {
      result = result.filter(s => s.departmentId === deptId);
    }

    // Filter 3: Dynamic Sorting
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

  // Dynamic paginated view slice
  paginatedStudents = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    const end = start + this.pageSize();
    return this.filteredStudents().slice(start, end);
  });

  ngOnInit(): void {
    this.loadData();
  }

  /**
   * Loads core lists concurrently on initialization.
   */
  loadData(): void {
    this.isLoading.set(true);
    this.deptService.getAll().subscribe({
      next: (depts) => {
        this.departments.set(depts);
        this.fetchStudents();
      },
      error: () => {
        this.toast.error('Failed to load departments.');
        this.fetchStudents(); // Try fetching students even if departments load fails
      }
    });
  }

  private fetchStudents(): void {
    this.studentService.getAll().subscribe({
      next: (data) => {
        this.students.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.toast.error('Failed to retrieve student records.');
        this.isLoading.set(false);
      }
    });
  }

  onPageChange(event: { pageIndex: number; pageSize: number }): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  onSortChange(event: { field: string; direction: 'asc' | 'desc' }): void {
    this.sortField.set(event.field);
    this.sortDirection.set(event.direction);
  }

  /**
   * Capture action clicks from the generic table.
   */
  onTableAction(event: { action: string; row: StudentResponseDto }): void {
    if (event.action === 'edit') {
      this.router.navigate(['/students/edit', event.row.id]);
    } else if (event.action === 'delete') {
      this.studentToDelete.set(event.row);
      this.isDeleteOpen.set(true);
    }
  }

  /**
   * Delete student and update local signals.
   */
  confirmDelete(): void {
    const student = this.studentToDelete();
    if (!student) return;

    this.isDeleting.set(true);
    this.studentService.delete(student.id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.isDeleteOpen.set(false);
        this.studentToDelete.set(null);
        this.toast.success(`Successfully removed student record: ${student.studentName}`);
        
        // Remove locally to save a network roundtrip and improve UI responsiveness
        this.students.update(curr => curr.filter(s => s.id !== student.id));
      },
      error: () => {
        this.isDeleting.set(false);
        this.toast.error('Unable to delete student. Please verify your system permissions.');
      }
    });
  }
}
