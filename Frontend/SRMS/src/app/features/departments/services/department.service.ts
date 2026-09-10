import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { DeptResponseDto, DeptCreateDto, DeptUpdateDto } from '../models/department.model';

/**
 * Department Service
 * ------------------
 * Communicates with the backend DepartmentController API.
 * Provides CRUD operations for department management.
 * Access: Admin only for all operations.
 */
@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/department`;

  /**
   * Fetches all department records.
   * Access: Admin only.
   */
  getAll(): Observable<DeptResponseDto[]> {
    return this.http.get<DeptResponseDto[]>(this.baseUrl);
  }

  /**
   * Fetches a department record by unique ID.
   * Access: Admin only.
   */
  getById(id: number): Observable<DeptResponseDto> {
    return this.http.get<DeptResponseDto>(`${this.baseUrl}/${id}`);
  }

  /**
   * Creates a new department record.
   * Access: Admin only.
   */
  create(dto: DeptCreateDto): Observable<DeptResponseDto> {
    return this.http.post<DeptResponseDto>(this.baseUrl, dto);
  }

  /**
   * Updates an existing department record.
   * Access: Admin only.
   */
  update(id: number, dto: DeptUpdateDto): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}`, dto);
  }

  /**
   * Deletes a department record.
   * Access: Admin only.
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
