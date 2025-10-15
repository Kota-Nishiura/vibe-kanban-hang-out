export interface ValidationError {
  field: 'title' | 'content';
  message: string;
}

export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };
