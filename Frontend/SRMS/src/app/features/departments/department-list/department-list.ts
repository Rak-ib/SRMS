import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { DepartmentService } from '../services/department.service';
import { DeptResponseDto } from '../models/department.model';
import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@shared/services/toast.service';
import { TableComponent, TableColumn } from '@shared/components/table/table';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner';
import { FormsModule } from '@angular/forms';

/**
 * Department List Component
 * ------------------------
 * Renders the department list view with table, search, and CRUD operations.
 * Follows the same pattern as StudentListComponent.
 * Access: Admin only.
 */
@Component({
  selector: 'app-department-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    TableComponent,
    ConfirmDialogComponent,
    LoadingSpinnerComponent,
    FormsModule
  ],
  templateUrl: './department-list.html'
})
export class DepartmentListComponent implements OnInit {
  private departmentService = inject(DepartmentService);
  private authService = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);

  // Core Data Signals
  departments = signal<DeptResponseDto[]>([]);
  isLoading = signal(false);

  // Search State Signals
  searchQuery = signal('');
  
  // Table Pagination & Sorting Signals
  pageIndex = signal(0);
  pageSize = signal(10);
  sortField = signal('name');
  sortDirection = signal<'asc' | 'desc'>('asc');

  // Deletion Modal States
  isDeleteOpen = signal(false);
  isDeleting = signal(false);
  departmentToDelete = signal<DeptResponseDto | null>(null);

  // Computed Permissions based on JWT active claims in AuthService
  canCreate = computed(() => this.authService.currentUser()?.role === 'Admin');
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

  // Table Column Definitions matching DeptResponseDto fields
  tableColumns: TableColumn[] = [
    { key: 'id', header: 'Department ID', sortable: true, align: 'left' },
    { key: 'name', header: 'Department Name', sortable: true, align: 'left' },
    { key: 'code', header: 'Department Code', sortable: true, align: 'left' }
  ];

  // Filter and sort computation. Runs locally since backend controller endpoints return raw lists.
  filteredDepartments = computed(() => {
    let result = [...this.departments()];

    // Filter: Search Query matching Name or Code
    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      result = result.filter(
        d => d.name.toLowerCase().includes(query) || 
             d.code.toLowerCase().includes(query)
      );
    }

    // Dynamic Sorting
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
  paginatedDepartments = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    const end = start + this.pageSize();
    return this.filteredDepartments().slice(start, end);
  });

  ngOnInit(): void {
    this.loadData();
  }

  /**
   * Loads departments list on initialization.
   */
  loadData(): void {
    this.isLoading.set(true);
    this.departmentService.getAll().subscribe({
      next: (data) => {
        this.departments.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.toast.error('Failed to retrieve department records.');
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
  onTableAction(event: { action: string; row: DeptResponseDto }): void {
    if (event.action === 'edit') {
      this.router.navigate(['/departments/edit', event.row.id]);
    } else if (event.action === 'delete') {
      this.departmentToDelete.set(event.row);
      this.isDeleteOpen.set(true);
    }
  }

  /**
   * Delete department and update local signals.
   */
  confirmDelete(): void {
    const department = this.departmentToDelete();
    if (!department) return;

    this.isDeleting.set(true);
    this.departmentService.delete(department.id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.isDeleteOpen.set(false);
        this.departmentToDelete.set(null);
        this.toast.success(`Successfully removed department: ${department.name}`);
        
        // Remove locally to save a network roundtrip and improve UI responsiveness
        this.departments.update(curr => curr.filter(d => d.id !== department.id));
      },
      error: () => {
        this.isDeleting.set(false);
        this.toast.error('Unable to delete department. Please verify your system permissions.');
      }
    });
  }
}
