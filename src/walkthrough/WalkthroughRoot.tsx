import { useEffect, type ReactNode } from "react";
import { WalkthroughProvider } from "./cursor";
import { useWalkthroughKeyboard } from "./keyboard";
import { WalkthroughOverlay } from "./WalkthroughOverlay";
import { WalkthroughHUD } from "./WalkthroughHUD";
import { SceneLauncher } from "./SceneLauncher";
import type { Sequence } from "./types";

function useVTNameUniquenessGuard() {
  useEffect(() => {
    if (import.meta.env.PROD) return;
    const check = () => {
      const seen = new Map<string, number>();
      document.querySelectorAll<HTMLElement>("[data-vt-name]").forEach((el) => {
        if (el.classList.contains("wt-stage-slot")) return; // slots intentionally share names
        const name = el.getAttribute("data-vt-name")!;
        seen.set(name, (seen.get(name) ?? 0) + 1);
      });
      for (const [name, count] of seen) {
        if (count > 1) {
          console.warn(`[walkthrough] duplicate view-transition-name in DOM: ${name} (count=${count})`);
        }
      }
    };
    check();
    const mo = new MutationObserver(check);
    mo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-vt-name"] });
    return () => mo.disconnect();
  }, []);
}

function Inner({ children }: { children: ReactNode }) {
  useWalkthroughKeyboard();
  useVTNameUniquenessGuard();
  return (
    <>
      {children}
      <WalkthroughOverlay />
      <WalkthroughHUD />
      <SceneLauncher />
    </>
  );
}

export function WalkthroughRoot({ sequence, children }: { sequence: Sequence; children: ReactNode }) {
  return (
    <WalkthroughProvider sequence={sequence}>
      <Inner>{children}</Inner>
    </WalkthroughProvider>
  );
}
