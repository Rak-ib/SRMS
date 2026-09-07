import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { AcademicTermResponseDto, AcademicTermCreateDto, AcademicTermUpdateDto } from '../models/academic-term.model';

@Injectable({
  providedIn: 'root'
})
export class AcademicTermService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/academicterm`;

  getAll(): Observable<AcademicTermResponseDto[]> {
    return this.http.get<AcademicTermResponseDto[]>(this.baseUrl);
  }

  getById(id: number): Observable<AcademicTermResponseDto> {
    return this.http.get<AcademicTermResponseDto>(`${this.baseUrl}/${id}`);
  }

  create(dto: AcademicTermCreateDto): Observable<AcademicTermResponseDto> {
    return this.http.post<AcademicTermResponseDto>(this.baseUrl, dto);
  }

  update(id: number, dto: AcademicTermUpdateDto): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
