/** Abortable fetch that gives up after `ms` (default 12s). */
export async function fetchWithTimeout(
  url: string,
  init?: RequestInit,
  ms = 12_000,
): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}
