import { useEffect, useState } from "react";

/** How long a page that "loads" (community feed, ARC form, …) shows its spinner. */
export const PAGE_LOAD_MS = 1500;

/**
 * True for PAGE_LOAD_MS after the page mounts, like fetching its content.
 * With enabled false the page mounts ready.
 */
export function usePageLoad(enabled = true): boolean {
  const [loading, setLoading] = useState(enabled);
  useEffect(() => {
    if (!enabled) return;
    const timer = setTimeout(() => setLoading(false), PAGE_LOAD_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- read on mount only
  }, []);
  return loading;
}
