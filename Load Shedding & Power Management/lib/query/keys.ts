import type { QueryParams } from "@/types/api";

/**
 * Query-key factories. Server prefetches and client hooks build keys from
 * the same functions, so hydrated data is picked up without a refetch.
 * Keys start with a resource name, which makes prefix invalidation easy.
 */
export const queryKeys = {
  notifications: {
    all: ["notifications"] as const,
    list: (params: QueryParams) => ["notifications", "list", params] as const,
    unread: () => ["notifications", "unread"] as const,
  },
  outages: {
    all: ["outages"] as const,
    list: (scope: "all" | "mine" | "assigned", params: QueryParams) => ["outages", scope, params] as const,
    detail: (id: string) => ["outages", "detail", id] as const,
  },
  schedules: {
    all: ["schedules"] as const,
    list: (params: QueryParams) => ["schedules", "list", params] as const,
    mine: () => ["schedules", "mine"] as const,
  },
  bills: {
    all: ["bills"] as const,
    list: (scope: "all" | "mine", params: QueryParams) => ["bills", scope, params] as const,
  },
  payments: {
    all: ["payments"] as const,
    list: (scope: "all" | "mine", params: QueryParams) => ["payments", scope, params] as const,
  },
  users: {
    all: ["users"] as const,
    list: (params: QueryParams) => ["users", "list", params] as const,
    technicians: (params: QueryParams) => ["users", "technicians", params] as const,
  },
  network: {
    all: ["network"] as const,
    list: (resource: string, params: QueryParams) => ["network", resource, params] as const,
    options: (resource: string, params: QueryParams = {}) => ["network", "options", resource, params] as const,
  },
  admin: {
    auditLogs: (params: QueryParams) => ["admin", "audit-logs", params] as const,
    contactMessages: (params: QueryParams) => ["admin", "contact-messages", params] as const,
  },
  me: {
    profile: () => ["me", "profile"] as const,
    connections: () => ["me", "connections"] as const,
  },
};
