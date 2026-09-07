/**
 * Enrollment API response DTO matching backend C# class.
 */
export interface EnrollmentResponseDto {
  id: number;
  academicTermId: number;
  studentId: number;
  courseId: number;
}

/**
 * Extended enrollment with joined course and term data for display.
 */
export interface EnrollmentWithDetailsDto extends EnrollmentResponseDto {
  courseCode?: string;
  courseTitle?: string;
  creditHours?: number;
  termName?: string;
  termNumber?: string;
}

/**
 * Enrollment creation payload DTO matching backend C# class.
 */
export interface EnrollmentCreateDto {
  academicTermId: number;
  studentId: number;
  courseId: number;
}

/**
 * Enrollment edit payload DTO matching backend C# class.
 */
export interface EnrollmentUpdateDto {
  academicTermId: number;
  studentId: number;
  courseId: number;
}
