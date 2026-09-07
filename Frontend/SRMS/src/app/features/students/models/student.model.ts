/**
 * Student API response DTO matching backend C# class.
 */
export interface StudentResponseDto {
  id: number;
  studentName: string;
  regNo: string;
  email: string;
  batchYear: string;
  departmentId: number;
  userId: number | null;
}

/**
 * Student creation payload DTO matching backend C# class.
 */
export interface StudentCreateDto {
  id: number; // self-assigned
  studentName: string;
  regNo: string;
  email: string;
  batchYear: string;
  departmentId: number;
  userId: number | null;
}

/**
 * Student edit payload DTO matching backend C# class.
 */
export interface StudentUpdateDto {
  studentName: string;
  email: string;
  batchYear: string;
  departmentId: number;
}
