# SRMS — Student Result Management System

A full-stack academic management platform for tracking students, departments, courses, academic terms, enrollments, and exam results. The frontend is a modern Angular 21 SPA with SSR; the backend is ASP.NET Core with JWT authentication.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture Decisions](#2-architecture-decisions)
   - [Folder Structure](#folder-structure)
   - [Signals over NgRx](#signals-over-ngrx)
   - [JWT Storage Decision](#jwt-storage-decision)
   - [Interceptor & Guard Design](#interceptor--guard-design)
3. [Setup & Run Instructions](#3-setup--run-instructions)
4. [Environment Configuration](#4-environment-configuration)
5. [How Authentication Works End-to-End](#5-how-authentication-works-end-to-end)
6. [Adding a New Feature Module](#6-adding-a-new-feature-module)
7. [Shared Components Reference](#7-shared-components-reference)
8. [Roadmap](#8-roadmap)

---

## 1. Project Overview

SRMS is a role-based academic records system with three actor types:

| Role | Access Summary |
|---|---|
| **Admin** | Full CRUD across all entities |
| **Teacher** | Read + create/update Students, Courses, Enrollments, Results |
| **Student** | Read-only access to own record, own enrollments and results |

**Tech stack:**
- **Frontend**: Angular 21, standalone components, Angular Signals, Tailwind CSS v4, SSR (Angular Universal)
- **Backend**: ASP.NET Core Web API, Entity Framework Core, JWT authentication
- **Database**: MySQL
- **Build tool**: Vite (via `@angular/build`)

---

## 2. Architecture Decisions

### Folder Structure

```
src/
├── app/
│   ├── core/                        # Singleton services, guards, interceptors
│   │   ├── guards/
│   │   │   ├── auth.guard.ts        # Must-be-logged-in functional guard
│   │   │   └── role.guard.ts        # Role-allowlist functional guard
│   │   ├── handlers/
│   │   │   └── global-error-handler.ts  # Uncaught client error → Toast
│   │   ├── interceptors/
│   │   │   ├── auth.interceptor.ts      # Attaches Bearer token to every request
│   │   │   ├── error.interceptor.ts     # 401 auto-logout, 403 warning signal
│   │   │   └── api-error.interceptor.ts # Normalizes HttpErrorResponse → NormalizedError
│   │   └── services/
│   │       └── auth.service.ts          # JWT decode, signals, login/logout
│   │
│   ├── shared/                      # Generic reusable UI components & services
│   │   ├── components/
│   │   │   ├── table/               # Sortable, paginated generic data table
│   │   │   ├── confirm-dialog/      # Reusable destructive-action modal
│   │   │   ├── loading-spinner/     # Inline or full-overlay spinner
│   │   │   ├── toast/               # Floating notification component
│   │   │   └── form-input/          # Reactive-form-bound input with validation display
│   │   └── services/
│   │       └── toast.service.ts     # Signal-based notification bus
│   │
│   ├── layout/                      # App shell, navbar, sidebar
│   │   ├── shell/                   # Outer authenticated layout frame
│   │   ├── navbar/                  # Top navigation bar
│   │   └── sidebar/                 # Role-aware side navigation
│   │
│   ├── features/                    # Feature modules — one folder per domain entity
│   │   ├── auth/                    # Login page, access-denied page
│   │   ├── students/                # ✅ Fully built — reference implementation
│   │   ├── departments/             # 🔲 To build
│   │   ├── courses/                 # 🔲 To build
│   │   ├── academic-terms/          # 🔲 To build
│   │   ├── enrollments/             # 🔲 To build
│   │   └── results/                 # 🔲 To build
│   │
│   ├── app.routes.ts                # Root route definitions (lazy-loaded features)
│   ├── app.routes.server.ts         # SSR render mode config per route
│   └── app.config.ts                # Application providers (HttpClient, ErrorHandler, etc.)
│
└── environments/
    ├── environment.ts               # Development config (local API URL)
    └── environment.prod.ts          # Production config (live API URL)
```

**Why this structure?** Each layer has a single clear responsibility:
- `core/` holds infrastructure singletons — nothing here should be feature-specific.
- `shared/` holds UI atoms — generic, documented, reusable across every feature.
- `features/` holds domain logic — fully self-contained, lazy-loaded, no cross-feature imports.
- `layout/` holds the authenticated shell frame — separate from features so it can be composed independently.

### Signals over NgRx

Angular's built-in **Signals** API was chosen instead of NgRx for state management. The reasons:

| Consideration | Signals | NgRx |
|---|---|---|
| **Boilerplate** | Minimal — just `signal()` and `computed()` | High — Actions, Reducers, Selectors, Effects for every feature |
| **Bundle size** | Zero extra cost (built into Angular) | ~40–50 kB for NgRx + Effects |
| **Learning curve** | Shallow — one API to learn | Steep — Redux mental model required |
| **Granularity** | Per-component or per-service as needed | Global store, all-or-nothing architecture |
| **Async patterns** | RxJS Observables for HTTP, Signals for UI state | Requires NgRx Effects for async |
| **When NgRx is better** | — | Extremely complex cross-feature shared state, time-travel debugging, large teams needing strict discipline |

For an academic CRUD application at this scale, Signals provide reactive, composable state without the infrastructure overhead. Each feature component manages its own local signal state, and `AuthService` uses signals to broadcast auth state globally.

### JWT Storage Decision

The JWT is stored in **`localStorage`** under the key `srms_auth_token`.

**The trade-off:**

| | localStorage | httpOnly Cookie |
|---|---|---|
| **XSS risk** | ⚠️ Token accessible to any JS on the page | ✅ Never readable by JavaScript |
| **CSRF risk** | ✅ Not automatically sent by browser | ⚠️ Requires CSRF tokens or SameSite policy |
| **Simplicity** | ✅ Trivial to read/write in Angular | Requires server-side cookie handling |
| **SSR compatibility** | ⚠️ Must guard with `isPlatformBrowser()` | ✅ Cookie available server-side |
| **Cross-origin** | ✅ Works easily | Requires careful CORS + SameSite config |

**Why localStorage here?** The backend is a standalone ASP.NET Core API (not serving the frontend HTML), making httpOnly cookie management significantly more complex (requires CORS credential sharing, SameSite configuration, and cookie-setting endpoints). Given that the application enforces a strict Content Security Policy and doesn't load untrusted third-party scripts, XSS risk is mitigated at the application layer.

> ⚠️ **Security note**: If this application is ever deployed to production with sensitive student data, upgrading to httpOnly cookies is recommended. The `AuthService` isolates all token access behind `getToken()` and `isPlatformBrowser()` checks, making a future migration straightforward.

### Interceptor & Guard Design

Three functional HTTP interceptors run in this order in `app.config.ts`:

```
Request ──► authInterceptor ──► apiErrorInterceptor ──► errorInterceptor ──► Backend
Response ◄─────────────────────────────────────────────────────────────────────────
```

| Interceptor | Responsibility |
|---|---|
| `authInterceptor` | Reads token from `AuthService` and clones every outgoing request with `Authorization: Bearer <token>` |
| `apiErrorInterceptor` | Catches `HttpErrorResponse`, parses ASP.NET Core `ValidationProblemDetails` or `ProblemDetails` into a consistent `NormalizedError { message, errors?, status }` object — re-throws this shape so components don't need to parse raw HTTP errors |
| `errorInterceptor` | Acts on `NormalizedError` shape: calls `authService.logout()` on 401, sets `authService.forbiddenError` signal on 403 |

Two functional route guards:

| Guard | Logic |
|---|---|
| `authGuard` | Checks `authService.isAuthenticated()`. If false, redirects to `/login` |
| `roleGuard` | Reads `data.roles` from the route config, checks `authService.currentUser()?.role`. If role not in the allowlist, redirects to `/access-denied` |

Guards are applied at the parent route level — child routes inherit them automatically, so there's no guard duplication across `new`/`edit/:id` subroutes.

---

## 3. Setup & Run Instructions

### Prerequisites

- [Node.js](https://nodejs.org) v20+ and npm v10+
- [.NET 8 SDK](https://dotnet.microsoft.com/download) (for the backend)
- MySQL 8.0+

### Backend Setup

```bash
cd Backend/StudentResultSystem

# Restore dependencies
dotnet restore

# Apply database migrations
dotnet ef database update --project StudentResultSystem.Infrastructure --startup-project StudentResultSystem

# Run the API (default: http://localhost:5000)
dotnet run --project StudentResultSystem
```

The backend binds to `http://localhost:5000` by default. Verify the API is running by navigating to `http://localhost:5000/swagger`.

### Frontend Setup

```bash
cd Frontend/SRMS

# Install dependencies
npm install

# Start development server with hot reload (http://localhost:4200)
npm start
```

### Production Build

```bash
npm run build
# Output: dist/SRMS/
```

---

## 4. Environment Configuration

The frontend uses Angular's file-replacement environment system. No `.env` files are needed.

**`src/environments/environment.ts`** (development — used by `npm start`):
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api'
};
```

**`src/environments/environment.prod.ts`** (production — used by `npm run build`):
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.srms.example.com/api'   // ← update for your deployment
};
```

The swap is configured in `angular.json` via `fileReplacements`. The `apiUrl` value is the base URL for all HTTP requests — feature services append their own paths (e.g. `/students`, `/department`).

> **Pattern**: All feature services import environment using the `@env` path alias:
> ```typescript
> import { environment } from '@env/environment';
> ```
> Never use relative paths (`../../environments/...`) — depth varies per folder and causes build failures.

**Configured path aliases** (`tsconfig.json`):

| Alias | Resolves to |
|---|---|
| `@core/*` | `src/app/core/*` |
| `@shared/*` | `src/app/shared/*` |
| `@features/*` | `src/app/features/*` |
| `@env/*` | `src/environments/*` |

---

## 5. How Authentication Works End-to-End

### Login Flow

```
User submits form
       │
       ▼
LoginComponent.onSubmit()
       │ calls
       ▼
AuthService.login({ username, password })
       │ POST /api/auth/login
       ▼
Backend validates credentials → returns { token: "eyJ..." }
       │
       ▼
AuthService.setSession(token)
       ├─ Stores token: localStorage.setItem('srms_auth_token', token)
       └─ Decodes payload: AuthService.decodeToken(token)
              │ extracts: id, name, email, role, exp
              └─ Sets: currentUser.set(user)
       │
       ▼
LoginComponent observes success → Router.navigate(['/dashboard'])
```

### JWT Decoding

The token is decoded **client-side** without any library. `AuthService.decodeToken()` splits the JWT into its three parts, Base64Url-decodes the payload, and parses the JSON. It handles both standard OAuth/JWT claim names and ASP.NET Core's verbose XML schema ClaimTypes:

| Field | Tries in order |
|---|---|
| `id` | `nameidentifier` XML claim → `nameid` → `sub` |
| `name` | `name` XML claim → `unique_name` → `name` |
| `email` | `emailaddress` XML claim → `email` |
| `role` | `role` XML claim → `role` |

### Session Persistence

On every app load, `AuthService` constructor calls `initializeAuth()`, which reads the stored token from `localStorage`, decodes it, and checks `exp` against the current timestamp. If expired or invalid, the token is cleared and the user is treated as unauthenticated.

### Request Authorization

Every HTTP request to the API automatically receives the `Authorization: Bearer <token>` header, injected by `authInterceptor`. Requests to non-API URLs (e.g. CDNs) are unaffected.

### Session Expiry / Revocation

If the backend returns HTTP **401**, `errorInterceptor` immediately calls `authService.logout()`, which:
1. Removes the token from `localStorage`
2. Sets `currentUser` signal to `null`
3. Navigates to `/login`

### 403 Handling

If the backend returns HTTP **403**, the user is not logged out (their session is still valid). Instead, `errorInterceptor` sets `authService.forbiddenError` to an error message string. The `ShellComponent` listens to this signal and renders a floating warning toast at the bottom-right of the screen for 5 seconds.

### Route Protection

```
/dashboard       → authGuard only (any authenticated user)
/students        → authGuard + roleGuard(['Admin', 'Teacher'])
/students/new    → inherits parent guard (Admin + Teacher)
/students/edit/:id → inherits parent guard (Admin + Teacher)
```

---

## 6. Adding a New Feature Module

Follow these exact steps to replicate the Students pattern. Replace `feature` / `Feature` / `FEATURE` with your entity name (e.g. `course`, `Course`).

### Step 1 — Create the model file

**`src/app/features/feature/models/feature.model.ts`**

```typescript
export interface FeatureResponseDto {
  id: number;
  // ... fields matching your backend C# ResponseDto exactly
}

export interface FeatureCreateDto {
  // ... fields matching your backend C# CreateDto exactly
}

export interface FeatureUpdateDto {
  // ... fields matching your backend C# UpdateDto exactly
}
```

> Map C# `PascalCase` → TypeScript `camelCase` (e.g. `CourseCode` → `courseCode`).

---

### Step 2 — Create the service

**`src/app/features/feature/services/feature.service.ts`**

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';   // ← always use @env alias
import { FeatureResponseDto, FeatureCreateDto, FeatureUpdateDto } from '../models/feature.model';

@Injectable({ providedIn: 'root' })
export class FeatureService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/feature`;  // ← match backend route

  getAll(): Observable<FeatureResponseDto[]> {
    return this.http.get<FeatureResponseDto[]>(this.baseUrl);
  }

  getById(id: number): Observable<FeatureResponseDto> {
    return this.http.get<FeatureResponseDto>(`${this.baseUrl}/${id}`);
  }

  create(dto: FeatureCreateDto): Observable<FeatureResponseDto> {
    return this.http.post<FeatureResponseDto>(this.baseUrl, dto);
  }

  update(id: number, dto: FeatureUpdateDto): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
```

---

### Step 3 — Create the list component

**`src/app/features/feature/feature-list/feature-list.ts`**

Key patterns to implement (all demonstrated in `StudentListComponent`):

```typescript
// 1. Role-based permission signals
canCreate = computed(() => {
  const role = this.authService.currentUser()?.role;
  return role === 'Admin' || role === 'Teacher';
});
canDelete = computed(() => this.authService.currentUser()?.role === 'Admin');

// 2. Build dynamic action array from permissions
tableActions = computed(() => {
  const actions = [];
  if (this.canEdit()) actions.push({ label: 'Edit', name: 'edit' });
  if (this.canDelete()) actions.push({ label: 'Delete', name: 'delete', class: '...' });
  return actions;
});

// 3. Optimistic local delete after API success
this.featureService.delete(id).subscribe({
  next: () => {
    this.items.update(curr => curr.filter(item => item.id !== id));
    this.toast.success('Deleted successfully.');
  }
});
```

**`src/app/features/feature/feature-list/feature-list.html`**

Wire up the shared components:
```html
<app-table
  [data]="paginatedItems()"
  [columns]="tableColumns"
  [totalItems]="filteredItems().length"
  [pageSize]="pageSize()"
  [pageIndex]="pageIndex()"
  [sortField]="sortField()"
  [sortDirection]="sortDirection()"
  [actions]="tableActions()"
  (pageChange)="onPageChange($event)"
  (sortChange)="onSortChange($event)"
  (actionClick)="onTableAction($event)"
></app-table>

<app-confirm-dialog
  [isOpen]="isDeleteOpen()"
  [isDeleting]="isDeleting()"
  [itemName]="itemToDelete()?.name"
  title="Delete Feature"
  message="Are you sure? This cannot be undone."
  (confirm)="confirmDelete()"
  (cancel)="isDeleteOpen.set(false)"
></app-confirm-dialog>
```

---

### Step 4 — Create the form component

**`src/app/features/feature/feature-form/feature-form.ts`**

Key patterns (all demonstrated in `StudentFormComponent`):

```typescript
// 1. Detect edit mode from route param
const idParam = this.route.snapshot.paramMap.get('id');
if (idParam) {
  this.isEditMode.set(true);
  this.loadDetails(+idParam);
}

// 2. Disable fields not in UpdateDto when editing
this.featureForm.get('readOnlyField')?.disable();

// 3. Map server validation errors back to form controls
private handleApiError(err: NormalizedError): void {
  if (err.errors) {
    Object.keys(err.errors).forEach(key => {
      const controlName = key.charAt(0).toLowerCase() + key.slice(1); // PascalCase → camelCase
      const control = this.featureForm.get(controlName);
      if (control) {
        control.setErrors({ serverError: err.errors![key][0] });
      }
    });
  }
}
```

Use `<app-form-input>` for each field — it automatically displays validation errors:
```html
<app-form-input
  id="fieldId"
  label="Field Label"
  [control]="getControl('fieldName')"
  placeholder="..."
></app-form-input>
```

---

### Step 5 — Add routes to `app.routes.ts`

```typescript
{
  path: 'feature',
  canActivate: [roleGuard],
  data: { roles: ['Admin', 'Teacher'] },  // ← adjust to your access rules
  children: [
    {
      path: '',
      loadComponent: () => import('./features/feature/feature-list/feature-list')
        .then(m => m.FeatureListComponent)
    },
    {
      path: 'new',
      loadComponent: () => import('./features/feature/feature-form/feature-form')
        .then(m => m.FeatureFormComponent)
    },
    {
      path: 'edit/:id',
      loadComponent: () => import('./features/feature/feature-form/feature-form')
        .then(m => m.FeatureFormComponent)
    }
  ]
},
```

---

### Step 6 — Register the SSR render mode

Open **`src/app/app.routes.server.ts`** and add an entry for the `:id` route **before** the `**` wildcard:

```typescript
export const serverRoutes: ServerRoute[] = [
  { path: 'students/edit/:id',  renderMode: RenderMode.Client },
  { path: 'feature/edit/:id',   renderMode: RenderMode.Client },  // ← add this
  { path: '**',                 renderMode: RenderMode.Prerender } // always last
];
```

> **Why**: Angular SSR tries to statically prerender every route at build time. Parameterized routes like `edit/:id` cannot be prerendered without providing all possible ID values — so we mark them as `Client` to render in the browser instead.

---

### Step 7 — Update the sidebar navigation

Open **`src/app/layout/sidebar/sidebar.ts`** and add the new route to the navigation items array for the appropriate roles.

---

### Step 8 — Verify the build

```bash
npm run build
```

The build should exit with code 0 with a new lazy chunk for your feature.

---

## 7. Shared Components Reference

| Component / Service | Selector / Import | Key Inputs | Key Outputs |
|---|---|---|---|
| `TableComponent` | `<app-table>` | `data`, `columns`, `totalItems`, `pageSize`, `pageIndex`, `sortField`, `sortDirection`, `actions` | `pageChange`, `sortChange`, `actionClick` |
| `ConfirmDialogComponent` | `<app-confirm-dialog>` | `isOpen`, `isDeleting`, `itemName`, `title`, `message` | `confirm`, `cancel` |
| `LoadingSpinnerComponent` | `<app-loading-spinner>` | `size` (`sm`/`md`/`lg`), `message`, `overlay` (boolean) | — |
| `FormInputComponent` | `<app-form-input>` | `control` (FormControl), `label`, `type`, `placeholder`, `id`, `errorMessages` | — |
| `ToastService` | `inject(ToastService)` | — | `.success()`, `.error()`, `.warning()`, `.info()`, `.show()` |

The `NormalizedError` interface from `api-error.interceptor.ts` is the standard error shape all feature components should handle:

```typescript
interface NormalizedError {
  message: string;                        // Human-readable summary
  errors?: Record<string, string[]>;      // Field-level validation errors (from ValidationProblemDetails)
  status: number;                         // HTTP status code
}
```

---

## 8. Roadmap

### Near-term

- Complete remaining feature modules following the Students pattern:
  - Departments CRUD
  - Courses CRUD
  - Academic Terms CRUD
  - Enrollments management
  - Results entry and reporting

### Infrastructure — Containerization (Planned)

The application is designed for deployment via Docker Compose with four containers:

```yaml
# Planned docker-compose.yml structure
services:
  frontend:   # Angular SSR — Node.js server serving dist/SRMS/server/
  backend:    # ASP.NET Core API
  db:         # MySQL 8.0 with persistent volume
  cache:      # Redis — for session management and query caching
```

Environment variables will be injected at container startup and mounted into Angular's `environment.prod.ts` via a build-arg or runtime config endpoint. No structural changes to the existing codebase are needed for this.

### AI Assistant — RAG-based Academic Query Engine (Planned)

A future planned feature is an in-app AI assistant that allows staff and students to query academic data using natural language:

> *"Which students in the Computer Science department have a GPA below 3.0 this term?"*
> *"Show me all failed results for Course CS301 in Spring 2026."*

**Intended architecture:**
- **Retrieval**: Relevant student/result records are retrieved from MySQL and formatted as context documents
- **Augmentation**: Documents are embedded and stored in a vector store (e.g. Redis with vector search, or a dedicated Qdrant instance)
- **Generation**: A language model (API-based, e.g. Gemini or GPT-4) receives the retrieved context + user question and produces a grounded response
- **Frontend**: A chat panel component within the existing Shell layout — no routing changes needed
- **Backend**: A dedicated `/api/ai/query` endpoint handling RAG orchestration

This feature does **not** require structural changes to the existing Angular codebase. A `features/ai-assistant/` folder and a new `AiService` following the established pattern will be sufficient.
