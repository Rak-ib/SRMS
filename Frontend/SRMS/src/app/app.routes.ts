import { Routes } from '@angular/router';
import { ShellComponent } from './layout/shell/shell';
import { LoginComponent } from './features/auth/login/login';
import { AccessDeniedComponent } from './features/auth/access-denied/access-denied';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // ── Public routes ────────────────────────────────────────────────────────────
  { path: 'login', component: LoginComponent },
  { path: 'access-denied', component: AccessDeniedComponent },

  // ── Authenticated shell ───────────────────────────────────────────────────────
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      // Dashboard — any authenticated role
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard')
          .then(m => m.DashboardComponent)
      },

      // ── My Profile — any authenticated role ───────────────────────────────
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/my-profile/my-profile')
          .then(m => m.MyProfileComponent)
      },

      // ── My Enrollments — Student only ────────────────────────────────────
      {
        path: 'my-enrollments',
        canActivate: [roleGuard],
        data: { roles: ['Student'] },
        loadComponent: () => import('./features/enrollments/my-enrollments/my-enrollments')
          .then(m => m.MyEnrollmentsComponent)
      },

      // ── My Results — Student only ────────────────────────────────────────
      {
        path: 'my-results',
        canActivate: [roleGuard],
        data: { roles: ['Student'] },
        loadComponent: () => import('./features/results/my-results/my-results')
          .then(m => m.MyResultsComponent)
      },

      // ── Students — Admin & Teacher only ────────────────────────────────────
      // PATTERN: child routes inherit the parent canActivate guard automatically.
      // No need to repeat the guard on each child.
      {
        path: 'students',
        canActivate: [roleGuard],
        data: { roles: ['Admin', 'Teacher'] },
        children: [
          {
            path: '',
            loadComponent: () => import('./features/students/student-list/student-list')
              .then(m => m.StudentListComponent)
          },
          {
            path: 'new',
            loadComponent: () => import('./features/students/student-form/student-form')
              .then(m => m.StudentFormComponent)
          },
          {
            path: 'edit/:id',
            loadComponent: () => import('./features/students/student-form/student-form')
              .then(m => m.StudentFormComponent)
          }
        ]
      },

      // ── Departments — Admin only ────────────────────────────────────────────
      {
        path: 'departments',
        canActivate: [roleGuard],
        data: { roles: ['Admin'] },
        children: [
          {
            path: '',
            loadComponent: () => import('./features/departments/department-list/department-list')
              .then(m => m.DepartmentListComponent)
          },
          {
            path: 'new',
            loadComponent: () => import('./features/departments/department-form/department-form')
              .then(m => m.DepartmentFormComponent)
          },
          {
            path: 'edit/:id',
            loadComponent: () => import('./features/departments/department-form/department-form')
              .then(m => m.DepartmentFormComponent)
          }
        ]
      },

      // ── Courses — Admin & Teacher ───────────────────────────────────────────
      {
        path: 'courses',
        canActivate: [roleGuard],
        data: { roles: ['Admin', 'Teacher'] },
        children: [
          {
            path: '',
            loadComponent: () => import('./features/courses/course-list/course-list')
              .then(m => m.CourseListComponent)
          },
          {
            path: 'new',
            loadComponent: () => import('./features/courses/course-form/course-form')
              .then(m => m.CourseFormComponent)
          },
          {
            path: 'edit/:id',
            loadComponent: () => import('./features/courses/course-form/course-form')
              .then(m => m.CourseFormComponent)
          }
        ]
      },

      // ── Academic Terms — Admin only ─────────────────────────────────────────
      {
        path: 'academic-terms',
        canActivate: [roleGuard],
        data: { roles: ['Admin'] },
        children: [
          {
            path: '',
            loadComponent: () => import('./features/academic-terms/term-list/term-list')
              .then(m => m.TermListComponent)
          },
          {
            path: 'new',
            loadComponent: () => import('./features/academic-terms/term-form/term-form')
              .then(m => m.TermFormComponent)
          },
          {
            path: 'edit/:id',
            loadComponent: () => import('./features/academic-terms/term-form/term-form')
              .then(m => m.TermFormComponent)
          }
        ]
      },

      // ── Enrollments — All authenticated roles ───────────────────────────────
      {
        path: 'enrollments',
        canActivate: [roleGuard],
        data: { roles: ['Admin', 'Teacher', 'Student'] },
        children: [
          {
            path: '',
            loadComponent: () => import('./features/enrollments/enrollment-list/enrollment-list')
              .then(m => m.EnrollmentListComponent)
          },
          {
            path: 'new',
            loadComponent: () => import('./features/enrollments/enrollment-form/enrollment-form')
              .then(m => m.EnrollmentFormComponent)
          },
          {
            path: 'edit/:id',
            loadComponent: () => import('./features/enrollments/enrollment-form/enrollment-form')
              .then(m => m.EnrollmentFormComponent)
          }
        ]
      },

      // ── Results — All authenticated roles ──────────────────────────────────
      {
        path: 'results',
        canActivate: [roleGuard],
        data: { roles: ['Admin', 'Teacher', 'Student'] },
        children: [
          {
            path: '',
            loadComponent: () => import('./features/results/result-list/result-list')
              .then(m => m.ResultListComponent)
          },
          {
            path: 'new',
            loadComponent: () => import('./features/results/result-form/result-form')
              .then(m => m.ResultFormComponent)
          },
          {
            path: 'edit/:id',
            loadComponent: () => import('./features/results/result-form/result-form')
              .then(m => m.ResultFormComponent)
          }
        ]
      }
    ]
  },

  // ── Catch-all ────────────────────────────────────────────────────────────────
  { path: '**', redirectTo: '' }
];
