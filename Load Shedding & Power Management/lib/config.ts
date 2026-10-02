import "server-only";

/**
 * Server-only configuration. Nothing here is prefixed NEXT_PUBLIC_, so none
 * of it (API origin, JWT secret, demo passwords) can reach a client bundle.
 */
const read = (key: string, fallback?: string): string => {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const serverConfig = {
  apiBaseUrl: read("API_BASE_URL", "http://localhost:5000/api/v1").replace(/\/$/, ""),
  isProduction: process.env.NODE_ENV === "production",
};

export const demoAccounts = {
  ADMIN: {
    email: read("DEMO_ADMIN_EMAIL", "admin@powergrid.bd"),
    password: read("DEMO_ADMIN_PASSWORD", "Admin@1234"),
  },
  CUSTOMER: {
    email: read("DEMO_CUSTOMER_EMAIL", "customer1@powergrid.bd"),
    password: read("DEMO_CUSTOMER_PASSWORD", "Customer@1234"),
  },
  TECHNICIAN: {
    email: read("DEMO_TECHNICIAN_EMAIL", "tech1@powergrid.bd"),
    password: read("DEMO_TECHNICIAN_PASSWORD", "Tech@1234"),
  },
} as const;
