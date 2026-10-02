import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { toast } from "sonner";
import type { ActionError } from "@/lib/api/errors";

/**
 * Applies a server action's error to a form: API field errors land on their
 * inputs; anything else becomes a toast. Returns true if a field matched.
 */
export function applyActionError<T extends FieldValues>(
  error: ActionError,
  setError: UseFormSetError<T>,
  fields: readonly Path<T>[]
): boolean {
  let matched = false;
  for (const { field, message } of error.fieldErrors) {
    if ((fields as readonly string[]).includes(field)) {
      setError(field as Path<T>, { type: "server", message });
      matched = true;
    }
  }
  if (!matched) toast.error(error.message);
  return matched;
}
