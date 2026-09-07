import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { StudentResponseDto, StudentCreateDto, StudentUpdateDto } from '../models/student.model';

/**
 * REFERENCE SERVICE PATTERN
 * -------------------------
 * This service communicates with the backend `StudentsController` API.
 * It is located in the feature-specific folder structure and injected in the root.
 * Register this structure pattern for other features.
 */
@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private http = inject(HttpClient);
  
  // Base endpoint pointing to backend route e.g., /api/students
  private readonly baseUrl = `${environment.apiUrl}/students`;

  /**
   * Fetches all student records.
   * Access: Admin, Teacher only.
   */
  getAll(): Observable<StudentResponseDto[]> {
    return this.http.get<StudentResponseDto[]>(this.baseUrl);
  }

  /**
   * Fetches the currently authenticated student's own profile.
   * The backend resolves identity from the JWT's NameIdentifier claim.
   * Access: Any authenticated user (backend enforces it returns only own record).
   */
  getMyProfile(): Observable<StudentResponseDto> {
    return this.http.get<StudentResponseDto>(`${this.baseUrl}/me`);
  }

  /**
   * Fetches a student record by unique ID.
   * Access: Admin, Teacher, or Student (Student can only request their own ID).
   */
  getById(id: number): Observable<StudentResponseDto> {
    return this.http.get<StudentResponseDto>(`${this.baseUrl}/${id}`);
  }

  /**
   * Fetches student records assigned to a specific department.
   * Access: Admin, Teacher only.
   */
  getByDepartment(departmentId: number): Observable<StudentResponseDto[]> {
    return this.http.get<StudentResponseDto[]>(`${this.baseUrl}/department/${departmentId}`);
  }

  /**
   * Creates a new student record (self-assigned ID).
   * Access: Admin, Teacher only.
   */
  create(dto: StudentCreateDto): Observable<StudentResponseDto> {
    return this.http.post<StudentResponseDto>(this.baseUrl, dto);
  }

  /**
   * Updates an existing student record.
   * Access: Admin, Teacher only.
   */
  update(id: number, dto: StudentUpdateDto): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, dto);
  }

  /**
   * Permanently deletes a student record.
   * Access: Admin only.
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
