import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { environment } from '@env/environment';
import { EnrollmentResponseDto, EnrollmentCreateDto, EnrollmentUpdateDto, EnrollmentWithDetailsDto } from '../models/enrollment.model';
import { StudentService } from '../../students/services/student.service';
import { CourseService } from '../../courses/services/course.service';
import { CourseResponseDto } from '../../courses/models/course.model';
import { AcademicTermService } from '../../academic-terms/services/academic-term.service';
import { AcademicTermResponseDto } from '../../academic-terms/models/academic-term.model';

/**
 * Enrollment Service
 * ------------------
 * Communicates with the backend EnrollmentController API.
 * Includes getMyEnrollments() which chains two API calls using switchMap:
 * 1. GET /api/students/me to get the logged-in student's ID
 * 2. GET /api/enrollments/student/{studentId} to fetch their enrollments
 * 
 * Why switchMap vs nested subscribes:
 * - switchMap automatically unsubscribes from the previous observable when a new value arrives
 * - It flattens the nested observables into a single stream, avoiding callback hell
 * - It handles the asynchronous chaining cleanly in a declarative way
 * - If the user navigates away before the first call completes, switchMap cancels it automatically
 * - It's the RxJS standard for dependent async operations (one call's output feeds into another)
 */
@Injectable({
  providedIn: 'root'
})
export class EnrollmentService {
  private http = inject(HttpClient);
  private studentService = inject(StudentService);
  private courseService = inject(CourseService);
  private termService = inject(AcademicTermService);
  
  private readonly baseUrl = `${environment.apiUrl}/enrollment`;

  /**
   * Fetches the currently authenticated student's enrollments.
   * Uses switchMap to chain: get student ID from /me, then fetch enrollments by that ID.
   * Returns enrollments enriched with course and term details.
   */
  getMyEnrollments(): Observable<EnrollmentWithDetailsDto[]> {
    return this.studentService.getMyProfile().pipe(
      // switchMap takes the student ID from the first call and uses it for the second
      switchMap(student => {
        return this.http.get<EnrollmentResponseDto[]>(`${this.baseUrl}/student/${student.id}`);
      })
    );
  }

  /**
   * Enriches raw enrollment data with course and term details for display.
   * This is called by the component after fetching enrollments.
   */
  enrichWithDetails(
    enrollments: EnrollmentResponseDto[],
    courses: CourseResponseDto[],
    terms: AcademicTermResponseDto[]
  ): EnrollmentWithDetailsDto[] {
    const courseMap = new Map(courses.map(c => [c.id, c]));
    const termMap = new Map(terms.map(t => [t.id, t]));

    return enrollments.map(enrollment => {
      const course = courseMap.get(enrollment.courseId);
      const term = termMap.get(enrollment.academicTermId);

      return {
        ...enrollment,
        courseCode: course?.code,
        courseTitle: course?.title,
        creditHours: course?.creditHours,
        termName: term?.termName,
        termNumber: term?.termNumber
      };
    });
  }

  getAll(): Observable<EnrollmentResponseDto[]> {
    return this.http.get<EnrollmentResponseDto[]>(this.baseUrl);
  }

  getById(id: number): Observable<EnrollmentResponseDto> {
    return this.http.get<EnrollmentResponseDto>(`${this.baseUrl}/${id}`);
  }

  getByCourse(courseId: number): Observable<EnrollmentResponseDto[]> {
    return this.http.get<EnrollmentResponseDto[]>(`${this.baseUrl}/course/${courseId}`);
  }

  getByAcademicTerm(academicTermId: number): Observable<EnrollmentResponseDto[]> {
    return this.http.get<EnrollmentResponseDto[]>(`${this.baseUrl}/academic-term/${academicTermId}`);
  }

  create(dto: EnrollmentCreateDto): Observable<EnrollmentResponseDto> {
    return this.http.post<EnrollmentResponseDto>(this.baseUrl, dto);
  }

  update(id: number, dto: EnrollmentUpdateDto): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
