import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { CourseResponseDto, CourseCreateDto, CourseUpdateDto } from '../models/course.model';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/course`;

  getAll(): Observable<CourseResponseDto[]> {
    return this.http.get<CourseResponseDto[]>(this.baseUrl);
  }

  getById(id: number): Observable<CourseResponseDto> {
    return this.http.get<CourseResponseDto>(`${this.baseUrl}/${id}`);
  }

  create(dto: CourseCreateDto): Observable<CourseResponseDto> {
    return this.http.post<CourseResponseDto>(this.baseUrl, dto);
  }

  update(id: number, dto: CourseUpdateDto): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
