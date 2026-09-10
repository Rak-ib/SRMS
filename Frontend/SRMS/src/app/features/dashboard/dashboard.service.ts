import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@env/environment';

/**
 * Dashboard Summary DTO matching backend response
 * Backend returns PascalCase properties, we map to camelCase for consistency
 */
export interface DashboardSummaryDto {
  totalStudents: number;
  totalCourses: number;
  totalDepartments: number;
  totalEnrollments: number;
}

/**
 * Dashboard Service
 * ----------------
 * Communicates with the backend DashboardController API.
 * Provides summary statistics for Admin/Teacher dashboard.
 * Access: Admin, Teacher only.
 */
@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/dashboard`;

  /**
   * Fetches dashboard summary statistics.
   * Access: Admin, Teacher only.
   * Maps backend PascalCase response to frontend camelCase.
   */
  getSummary(): Observable<DashboardSummaryDto> {
    return this.http.get<any>(`${this.baseUrl}/summary`).pipe(
      map(response => ({
        totalStudents: response.TotalStudents,
        totalCourses: response.TotalCourses,
        totalDepartments: response.TotalDepartments,
        totalEnrollments: response.TotalEnrollments
      }))
    );
  }
}