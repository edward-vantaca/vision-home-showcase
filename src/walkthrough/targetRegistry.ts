const registry = new Map<string, HTMLElement>();

export function registerTarget(id: string, el: HTMLElement): void {
  registry.set(id, el);
}

export function unregisterTarget(id: string): void {
  registry.delete(id);
}

export function resolveTarget(id: string): HTMLElement | null {
  const registered = registry.get(id);
  if (registered) return registered;
  const fallback = document.querySelector<HTMLElement>(`[data-ux-id="${CSS.escape(id)}"]`);
  return fallback ?? null;
}

export function clearRegistry(): void {
  registry.clear();
}
