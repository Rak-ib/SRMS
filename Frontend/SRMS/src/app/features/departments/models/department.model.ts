/**
 * Department API response DTO matching backend C# class.
 */
export interface DeptResponseDto {
  id: number;
  name: string;
  code: string;
}

/**
 * Department creation payload DTO matching backend C# class.
 */
export interface DeptCreateDto {
  name: string;
  code: string;
}

/**
 * Department edit payload DTO matching backend C# class.
 */
export interface DeptUpdateDto {
  name: string;
  code: string;
}