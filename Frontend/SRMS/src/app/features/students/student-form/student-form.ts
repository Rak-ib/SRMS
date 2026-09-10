import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { StudentService } from '../services/student.service';
import { DepartmentService } from '../../departments/services/department.service';
import { DeptResponseDto } from '../../departments/models/department.model';
import { ToastService } from '@shared/services/toast.service';
import { FormInputComponent } from '@shared/components/form-input/form-input';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner';
import { NormalizedError } from '@core/interceptors/api-error.interceptor';

/**
 * REFERENCE PATTERN: StudentFormComponent
 * --------------------------------------
 * Manages Create & Edit form views. Integrates reactive validation mapping.
 * Extensively documented to serve as a baseline model for other entity forms.
 */
@Component({
  selector: 'app-student-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    FormInputComponent,
    LoadingSpinnerComponent
  ],
  templateUrl: './student-form.html'
})
export class StudentFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private studentService = inject(StudentService);
  private deptService = inject(DepartmentService);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Form State Signals
  isEditMode = signal(false);
  isLoading = signal(false);
  studentId = signal<number | null>(null);
  
  // Available departments list dropdown data
  departments = signal<DeptResponseDto[]>([]);

  // Configure Form Group controls
  studentForm: FormGroup = this.fb.group({
    id: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
    studentName: ['', [Validators.required]],
    regNo: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    batchYear: ['', [Validators.required, Validators.pattern(/^[0-9]{4}$/)]], // 4-digit year format
    departmentId: ['', [Validators.required]],
    userId: [null]
  });

  // Access helper getters for form-input component references
  getControl(name: string): FormControl {
    return this.studentForm.get(name) as FormControl;
  }

  ngOnInit(): void {
    this.loadDepartments();
  }

  /**
   * Fetch departments list, then check parameters to configure Edit mode if ID is present.
   */
  private loadDepartments(): void {
    this.isLoading.set(true);
    this.deptService.getAll().subscribe({
      next: (depts) => {
        this.departments.set(depts);
        this.checkRouteParameters();
      },
      error: () => {
        this.toast.error('Failed to load department selection lists.');
        this.checkRouteParameters();
      }
    });
  }

  private checkRouteParameters(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = +idParam;
      this.studentId.set(id);
      this.isEditMode.set(true);
      this.loadStudentDetails(id);
    } else {
      this.isLoading.set(false);
    }
  }

  /**
   * Load existing student data to populate the form fields.
   */
  private loadStudentDetails(id: number): void {
    this.studentService.getById(id).subscribe({
      next: (student) => {
        this.studentForm.patchValue({
          id: student.id,
          studentName: student.studentName,
          regNo: student.regNo,
          email: student.email,
          batchYear: student.batchYear,
          departmentId: student.departmentId,
          userId: student.userId
        });
        
        // Disable non-updatable keys in Edit Mode matching backend DTO rules
        this.studentForm.get('id')?.disable();
        this.studentForm.get('regNo')?.disable();
        this.isLoading.set(false);
      },
      error: () => {
        this.toast.error('Failed to load student details.');
        this.router.navigate(['/students']);
      }
    });
  }

  onSubmit(): void {
    if (this.studentForm.invalid) {
      this.studentForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const formValue = this.studentForm.getRawValue();

    if (this.isEditMode()) {
      // Update DTO maps only: StudentName, Email, BatchYear, DepartmentId
      const updateDto = {
        studentName: formValue.studentName,
        email: formValue.email,
        batchYear: formValue.batchYear,
        departmentId: +formValue.departmentId
      };

      this.studentService.update(this.studentId()!, updateDto).subscribe({
        next: () => {
          this.toast.success('Student record updated successfully.');
          this.router.navigate(['/students']);
        },
        error: (err: NormalizedError) => this.handleApiError(err)
      });
    } else {
      // Create DTO accepts all fields
      const createDto = {
        id: +formValue.id,
        studentName: formValue.studentName,
        regNo: formValue.regNo,
        email: formValue.email,
        batchYear: formValue.batchYear,
        departmentId: +formValue.departmentId,
        userId: formValue.userId ? +formValue.userId : null
      };

      this.studentService.create(createDto).subscribe({
        next: () => {
          this.toast.success('Student record created successfully.');
          this.router.navigate(['/students']);
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
        // Map DTO keys (like StudentName/RegNo) to lowercase Form Control names (like studentName/regNo)
        const controlName = key.charAt(0).toLowerCase() + key.slice(1);
        const control = this.studentForm.get(controlName);
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
