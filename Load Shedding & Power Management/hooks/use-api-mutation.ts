"use client";

import {
  useMutation,
  useQueryClient,
  type QueryKey,
  type UseMutationOptions,
} from "@tanstack/react-query";
import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { toast } from "sonner";
import { ApiError, errorMessage, isApiError } from "@/lib/api/errors";

interface ApiMutationOptions<TData, TVariables, TForm extends FieldValues>
  extends Omit<UseMutationOptions<TData, ApiError, TVariables>, "onError"> {
  /** Toast shown on success; a function receives the response. */
  successMessage?: string | ((data: TData) => string);
  /** Query keys to invalidate after success (prefix match). */
  invalidate?: QueryKey[];
  /** Maps the API's field errors onto a react-hook-form instance. */
  setError?: UseFormSetError<TForm>;
  onError?: (error: ApiError) => void;
}

/**
 * useMutation with the app's conventions baked in: a success toast, cache
 * invalidation, and API validation errors shown on the matching form field
 * (or as an error toast when they do not belong to a field).
 */
export function useApiMutation<TData, TVariables = void, TForm extends FieldValues = FieldValues>({
  successMessage,
  invalidate = [],
  setError,
  onSuccess,
  onError,
  ...options
}: ApiMutationOptions<TData, TVariables, TForm>) {
  const queryClient = useQueryClient();

  return useMutation<TData, ApiError, TVariables>({
    ...options,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await Promise.all(invalidate.map((queryKey) => queryClient.invalidateQueries({ queryKey })));
      if (successMessage) {
        toast.success(typeof successMessage === "function" ? successMessage(data) : successMessage);
      }
      await onSuccess?.(data, variables, onMutateResult, context);
    },
    onError: (error) => {
      const apiError = isApiError(error) ? error : new ApiError(0, errorMessage(error));

      let mapped = false;
      if (setError) {
        for (const { field, message } of apiError.fieldErrors) {
          if (field && field !== "body") {
            setError(field as Path<TForm>, { type: "server", message });
            mapped = true;
          }
        }
      }

      if (!mapped) toast.error(apiError.message);
      onError?.(apiError);
    },
  });
}
