import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { useLiftTarget } from "./useLiftTarget";

type Props = { target: string; children: ReactNode };

/**
 * Expands a target into a detail panel. The real target is lifted in place via
 * useLiftTarget (kept at its current lift if a LiftBeat just handed it off,
 * otherwise centered at scale 1) and dissolved to opacity 0, while the panel
 * fades in at center: the card appears to become the panel.
 *
 * Scene isolation invariant (spec section 7): every inline style written on the
 * target is snapshotted first and restored on unmount, so nothing bleeds into
 * the next scene. The panel itself is React-owned and simply unmounts.
 */
export function ExpandBeat({ target, children }: Props) {
  useLiftTarget(target, { scale: 1, position: "center", dissolve: true });

  const [shown, setShown] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const style: CSSProperties = {
    position: "fixed",
    top: "50%",
    left: "50%",
    translate: "-50% -50%",
    pointerEvents: "auto",
    maxWidth: "min(1000px, 90vw)",
    maxHeight: "calc(100vh - 160px)",
    overflowY: "auto",
    background: "white",
    borderRadius: "16px",
    boxShadow: "0 24px 60px rgba(0,0,0,.25)",
    opacity: shown ? 1 : 0,
    transition: "opacity 500ms ease-out",
  };

  return <div style={style}>{children}</div>;
}
