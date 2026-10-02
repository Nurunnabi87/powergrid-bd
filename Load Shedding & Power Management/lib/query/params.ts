import type { QueryParams } from "@/types/api";

type ParamSource = URLSearchParams | Record<string, string | string[] | undefined>;

const NUMERIC = new Set(["page", "limit"]);

const read = (source: ParamSource, key: string): string | undefined => {
  if (source instanceof URLSearchParams) return source.get(key) ?? undefined;
  const value = source[key];
  return Array.isArray(value) ? value[0] : value;
};

/**
 * Reads the given keys from either a server `searchParams` object or a
 * client `URLSearchParams`, producing the same normalised object on both
 * sides — so a server prefetch and the client query share one cache key.
 */
export function pickParams(
  source: ParamSource,
  keys: readonly string[],
  defaults: QueryParams = {}
): QueryParams {
  const params: QueryParams = {};
  for (const key of keys) {
    const raw = read(source, key)?.trim();
    if (raw) {
      if (NUMERIC.has(key)) {
        const value = Number(raw);
        if (Number.isInteger(value) && value > 0) params[key] = value;
      } else {
        params[key] = raw;
      }
    } else if (defaults[key] !== undefined) {
      params[key] = defaults[key];
    }
  }
  return params;
}
