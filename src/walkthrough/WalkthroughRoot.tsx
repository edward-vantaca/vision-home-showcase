import type { ReactNode } from "react";
import { WalkthroughProvider } from "./cursor";
import { useWalkthroughKeyboard } from "./keyboard";
import { WalkthroughOverlay } from "./WalkthroughOverlay";
import { WalkthroughHUD } from "./WalkthroughHUD";
import { SceneLauncher } from "./SceneLauncher";
import type { Sequence } from "./types";

function Inner({ children }: { children: ReactNode }) {
  useWalkthroughKeyboard();
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
