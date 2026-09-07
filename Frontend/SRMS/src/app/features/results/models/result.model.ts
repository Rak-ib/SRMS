

export interface ResultResponseDto {
    id: number;
    enrollmentId: number;
    gradePoint: number| null;
    letterGrade: string | null;
    publishedAt: string | null;
}


/**
 * Extended result with enrollment, course and term details for display.
 */
export interface ResultWithDetailsDto extends ResultResponseDto {
  courseCode?: string;
  courseTitle?: string;
  creditHours?: number;
  termName?: string;
  termNumber?: string;
  gradePointDisplay?: string;
  letterGradeDisplay?: string;
}