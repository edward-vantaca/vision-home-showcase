import { useEffect, type ReactNode } from "react";

type Props = { target: string; children: ReactNode };

function findScene(name: string): HTMLElement | null {
  const all = Array.from(document.querySelectorAll<HTMLElement>(`[data-vt-name="${name}"]`));
  return all.find((el) => !el.classList.contains("wt-stage-slot")) ?? null;
}

export function ExpandBeat({ target, children }: Props) {
  useEffect(() => {
    const scene = findScene(target);
    if (!scene) return;
    scene.style.visibility = "hidden";
    return () => {
      scene.style.visibility = "";
    };
  }, [target]);

  const style: React.CSSProperties = {
    position: "fixed",
    top: "50%",
    left: "50%",
    translate: "-50% -50%",
    viewTransitionName: target,
    pointerEvents: "auto",
    maxWidth: "min(1000px, 90vw)",
    maxHeight: "calc(100vh - 160px)",
    overflowY: "auto",
    background: "white",
    borderRadius: "16px",
    boxShadow: "0 24px 60px rgba(0,0,0,.25)",
  };

  return (
    <div className="wt-stage-slot" data-vt-name={target} style={style}>
      {children}
    </div>
  );
}
