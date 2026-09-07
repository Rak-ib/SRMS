/**
 * Course API response DTO matching backend C# class.
 */
export interface CourseResponseDto {
  id: number;
  title: string;
  code: string;
  creditHours: number;
  termNumber: string;
  departmentId: number;
}

/**
 * Course creation payload DTO matching backend C# class.
 */
export interface CourseCreateDto {
  title: string;
  code: string;
  creditHours: number;
  termNumber: string;
  departmentId: number;
}

/**
 * Course edit payload DTO matching backend C# class.
 */
export interface CourseUpdateDto {
  title: string;
  code: string;
  creditHours: number;
  termNumber: string;
  departmentId: number;
}
