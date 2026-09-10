import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { DepartmentService } from '../services/department.service';
import { DeptResponseDto, DeptCreateDto, DeptUpdateDto } from '../models/department.model';
import { ToastService } from '@shared/services/toast.service';
import { FormInputComponent } from '@shared/components/form-input/form-input';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner';
import { NormalizedError } from '@core/interceptors/api-error.interceptor';

/**
 * Department Form Component
 * ------------------------
 * Manages Create & Edit form views for departments.
 * Follows the same pattern as StudentFormComponent.
 * Access: Admin only.
 */
@Component({
  selector: 'app-department-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    FormInputComponent,
    LoadingSpinnerComponent
  ],
  templateUrl: './department-form.html'
})
export class DepartmentFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private departmentService = inject(DepartmentService);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Form State Signals
  isEditMode = signal(false);
  isLoading = signal(false);
  departmentId = signal<number | null>(null);

  // Configure Form Group controls
  departmentForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    code: ['', [Validators.required]]
  });

  // Access helper getters for form-input component references
  getControl(name: string): FormControl {
    return this.departmentForm.get(name) as FormControl;
  }

  ngOnInit(): void {
    this.checkRouteParameters();
  }

  private checkRouteParameters(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = +idParam;
      this.departmentId.set(id);
      this.isEditMode.set(true);
      this.loadDepartmentDetails(id);
    }
  }

  /**
   * Load existing department data to populate the form fields.
   */
  private loadDepartmentDetails(id: number): void {
    this.isLoading.set(true);
    this.departmentService.getById(id).subscribe({
      next: (department) => {
        this.departmentForm.patchValue({
          name: department.name,
          code: department.code
        });
        this.isLoading.set(false);
      },
      error: () => {
        this.toast.error('Failed to load department details.');
        this.router.navigate(['/departments']);
      }
    });
  }

  onSubmit(): void {
    if (this.departmentForm.invalid) {
      this.departmentForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const formValue = this.departmentForm.getRawValue();

    if (this.isEditMode()) {
      // Update DTO maps: Name, Code
      const updateDto: DeptUpdateDto = {
        name: formValue.name,
        code: formValue.code
      };

      this.departmentService.update(this.departmentId()!, updateDto).subscribe({
        next: () => {
          this.toast.success('Department updated successfully.');
          this.router.navigate(['/departments']);
        },
        error: (err: NormalizedError) => this.handleApiError(err)
      });
    } else {
      // Create DTO accepts all fields
      const createDto: DeptCreateDto = {
        name: formValue.name,
        code: formValue.code
      };

      this.departmentService.create(createDto).subscribe({
        next: () => {
          this.toast.success('Department created successfully.');
          this.router.navigate(['/departments']);
        },
        error: (err: NormalizedError) => this.handleApiError(err)
      });
    }
  }

  /**
   * Maps server-side validation error dictionaries directly back to individual form controls.
   */
  private handleApiError(err: NormalizedError): void {
    this.isLoading.set(false);
    
    if (err.errors) {
      Object.keys(err.errors).forEach(key => {
        // Map DTO keys (like Name/Code) to lowercase Form Control names (like name/code)
        const controlName = key.charAt(0).toLowerCase() + key.slice(1);
        const control = this.departmentForm.get(controlName);
        if (control) {
          control.setErrors({ serverError: err.errors![key][0] });
        }
      });
      this.toast.error('Validation failed. Please verify your inputs.');
    } else {
      this.toast.error(err.message || 'An unexpected error occurred during save.');
    }
  }
}
