import type { ApiErrorBody, FieldError } from "@/types/api";

/**
 * Error thrown for every non-2xx API response. Shared by server and client
 * code so callers can branch on `status` and map `fieldErrors` onto forms.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors: FieldError[];

  constructor(status: number, message: string, fieldErrors: FieldError[] = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }

  static fromBody(status: number, body: unknown): ApiError {
    const parsed = body as Partial<ApiErrorBody> | null;
    return new ApiError(
      status,
      parsed?.message ?? `Request failed with status ${status}`,
      parsed?.errors ?? []
    );
  }
}

export const isApiError = (error: unknown): error is ApiError => error instanceof ApiError;

/** A human-readable message for any thrown value. */
export const errorMessage = (error: unknown, fallback = "Something went wrong"): string => {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
};

/** Serialisable form of an ApiError, for returning from server actions. */
export interface ActionError {
  ok: false;
  status: number;
  message: string;
  fieldErrors: FieldError[];
}

export const toActionError = (error: unknown): ActionError => {
  if (isApiError(error)) {
    return {
      ok: false,
      status: error.status,
      message: error.message,
      fieldErrors: error.fieldErrors,
    };
  }
  return {
    ok: false,
    status: 500,
    message: "Could not reach the PowerGrid service. Please try again.",
    fieldErrors: [],
  };
};
