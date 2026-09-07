/**
 * AcademicTerm API response DTO matching backend C# class.
 */
export interface AcademicTermResponseDto {
  id: number;
  termName: string;
  termNumber: string;
  startDate: string;
  endDate: string;
}

/**
 * AcademicTerm creation payload DTO matching backend C# class.
 */
export interface AcademicTermCreateDto {
  termName: string;
  termNumber: string;
  startDate: string;
  endDate: string;
}

/**
 * AcademicTerm edit payload DTO matching backend C# class.
 */
export interface AcademicTermUpdateDto {
  termName: string;
  termNumber: string;
  startDate: string;
  endDate: string;
}
