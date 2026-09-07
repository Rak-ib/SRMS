import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface DeptResponseDto {
  id: number;
  name: string;
  code: string;
}

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/department`;

  getAll(): Observable<DeptResponseDto[]> {
    console.log("from department service", this.baseUrl);
    return this.http.get<DeptResponseDto[]>(this.baseUrl);
  }
}
