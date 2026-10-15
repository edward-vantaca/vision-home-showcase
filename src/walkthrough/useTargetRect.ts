import { useLayoutEffect, useState } from "react";

function findByVTName(name: string): HTMLElement | null {
  // We tag participating elements with data-vt-name mirroring viewTransitionName
  // (CSS attribute lookup is more reliable than style-attribute parsing).
  return document.querySelector<HTMLElement>(`[data-vt-name="${name}"]`);
}

export function useTargetRect(name: string | null): DOMRect | null {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useLayoutEffect(() => {
    if (!name) {
      setRect(null);
      return;
    }
    const compute = () => {
      const el = findByVTName(name);
      setRect(el ? el.getBoundingClientRect() : null);
    };
    compute();
    window.addEventListener("resize", compute);
    window.addEventListener("scroll", compute, true);
    return () => {
      window.removeEventListener("resize", compute);
      window.removeEventListener("scroll", compute, true);
    };
  }, [name]);

  return rect;
}
