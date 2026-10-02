/** Pagination block returned by every list endpoint. */
export interface Meta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Success envelope: `{ success, message, meta?, data }`. */
export interface ApiSuccess<T> {
  success: true;
  message: string;
  meta?: Meta;
  data: T;
}

export interface FieldError {
  field: string;
  message: string;
}

/** Error envelope. `errors[].field` has the body./query./params. prefix stripped. */
export interface ApiErrorBody {
  success: false;
  message: string;
  errors?: FieldError[];
}

export type ApiResponse<T> = ApiSuccess<T> | ApiErrorBody;

/** A page of results, as consumed by tables and lists. */
export interface Paginated<T> {
  data: T[];
  meta: Meta;
}

/** Common list query parameters understood by the backend query builder. */
export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export type QueryValue = string | number | boolean | undefined | null;
export type QueryParams = Record<string, QueryValue>;
