import { QueryCache, QueryClient, isServer } from "@tanstack/react-query";
import { toast } from "sonner";
import { errorMessage, isApiError } from "@/lib/api/errors";

const makeQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // Data prefetched on the server stays fresh long enough that the
        // client does not immediately refetch it after hydration.
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) =>
          // Client errors (bad filter, forbidden, not found) will not fix
          // themselves; only retry network/server failures.
          !(isApiError(error) && error.status >= 400 && error.status < 500) && failureCount < 2,
      },
    },
    queryCache: new QueryCache({
      onError: (error, query) => {
        // Background refetch failures of data already on screen get a toast;
        // first-load failures render the component's own error state.
        if (query.state.data !== undefined && !(isApiError(error) && error.status === 401)) {
          toast.error(errorMessage(error, "Could not refresh data"));
        }
      },
    }),
  });

let browserQueryClient: QueryClient | undefined;

/** A fresh client per server render; one shared client in the browser. */
export function getQueryClient(): QueryClient {
  if (isServer) return makeQueryClient();
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}
