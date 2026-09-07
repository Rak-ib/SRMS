import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap, forkJoin } from 'rxjs';
import { environment } from '@env/environment';
import { ResultResponseDto, ResultWithDetailsDto } from '../models/result.model';
import { StudentService } from '../../students/services/student.service';
import { EnrollmentService } from '../../enrollments/services/enrollment.service';
import { EnrollmentWithDetailsDto } from '../../enrollments/models/enrollment.model';

/**
 * Result Service
 * --------------
 * Communicates with the backend ResultController API.
 * Includes getMyResults() which chains API calls using switchMap and forkJoin:
 * 1. GET /api/students/me to get the logged-in student's ID
 * 2. Then uses forkJoin to fetch results and CGPA in PARALLEL
 * 
 * Why switchMap: Used to chain dependent async operations (student ID needed first)
 * Why forkJoin: Used to execute independent operations in parallel (results and CGPA don't depend on each other)
 * 
 * forkJoin vs sequential calls:
 * - forkJoin executes multiple observables in parallel and waits for all to complete
 * - This is more efficient than sequential calls when operations are independent
 * - Reduces total wait time (parallel vs sum of individual times)
 * - Perfect for fetching results and CGPA simultaneously since they need the same student ID but don't depend on each other
 */
@Injectable({
  providedIn: 'root'
})
export class ResultService {
  private http = inject(HttpClient);
  private studentService = inject(StudentService);
  private enrollmentService = inject(EnrollmentService);
  
  private readonly baseUrl = `${environment.apiUrl}/result`;

  /**
   * Fetches the currently authenticated student's results, CGPA, and enrollments.
   * Uses switchMap to get student ID first, then forkJoin for parallel fetch of results, CGPA, and enrollments.
   * Returns enriched results with course and term details plus the CGPA.
   */
  getMyResults(): Observable<{ results: ResultWithDetailsDto[]; cgpa: number; enrollments: EnrollmentWithDetailsDto[] }> {
    return this.studentService.getMyProfile().pipe(
      // switchMap: get student ID from /me, then use it for parallel calls
      switchMap(student => {
        // forkJoin: execute results, CGPA, and enrollments calls in parallel
        return forkJoin({
          results: this.http.get<ResultResponseDto[]>(`${this.baseUrl}/student/${student.id}`),
          cgpa: this.http.get<number>(`${this.baseUrl}/student/${student.id}/cgpa`),
          enrollments: this.enrollmentService.getMyEnrollments()
        });
      })
    );
  }

  /**
   * Enriches raw result data with enrollment, course and term details for display.
   * This is called by the component after fetching results and enrollments.
   * Since enrollments are already enriched with course and term details, we can use them directly.
   */
  enrichWithDetails(
    results: ResultResponseDto[],
    enrollments: EnrollmentWithDetailsDto[]
  ): ResultWithDetailsDto[] {
    const enrollmentMap = new Map(enrollments.map(e => [e.id, e]));

    return results.map(result => {
      const enrollment = enrollmentMap.get(result.enrollmentId);

      return {
        ...result,
        courseCode: enrollment?.courseCode,
        courseTitle: enrollment?.courseTitle,
        creditHours: enrollment?.creditHours,
        termName: enrollment?.termName,
        termNumber: enrollment?.termNumber
      };
    });
  }

  getAll(): Observable<ResultResponseDto[]> {
    return this.http.get<ResultResponseDto[]>(this.baseUrl);
  }

  getById(id: number): Observable<ResultResponseDto> {
    return this.http.get<ResultResponseDto>(`${this.baseUrl}/${id}`);
  }

  getByStudent(studentId: number): Observable<ResultResponseDto[]> {
    return this.http.get<ResultResponseDto[]>(`${this.baseUrl}/student/${studentId}`);
  }

  create(dto: any): Observable<ResultResponseDto> {
    return this.http.post<ResultResponseDto>(this.baseUrl, dto);
  }

  update(id: number, dto: any): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}