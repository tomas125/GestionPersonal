export type SearchParamsInput = Record<string, string | undefined>;

export function buildQueryString(
  current: SearchParamsInput,
  updates: SearchParamsInput,
): string {
  const params = new URLSearchParams();
  const merged = { ...current, ...updates };
  for (const [key, value] of Object.entries(merged)) {
    if (value) params.set(key, value);
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}
