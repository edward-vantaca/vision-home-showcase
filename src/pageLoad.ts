import { useEffect, useState } from "react";

/** How long a page that "loads" (community feed, ARC form) shows its spinner. */
export const PAGE_LOAD_MS = 1500;

/** True for PAGE_LOAD_MS after the page mounts, like fetching its content. */
export function usePageLoad(): boolean {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), PAGE_LOAD_MS);
    return () => clearTimeout(timer);
  }, []);
  return loading;
}
