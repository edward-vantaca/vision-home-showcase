import { useEffect } from "react";
import type { Point } from "../types";

type Props = {
  target: string;
  scale?: number;
  position?: "center" | Point;
};

function findScene(name: string): HTMLElement | null {
  // The scene-side element — not the stage slot (which has class wt-stage-slot).
  const all = Array.from(document.querySelectorAll<HTMLElement>(`[data-vt-name="${name}"]`));
  return all.find((el) => !el.classList.contains("wt-stage-slot")) ?? null;
}

export function LiftBeat({ target, scale = 1.4, position = "center" }: Props) {
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
    viewTransitionName: target,
    transform: `scale(${scale})`,
    transformOrigin: "center center",
    pointerEvents: "none",
    ...(position === "center"
      ? { top: "50%", left: "50%", translate: "-50% -50%" }
      : { top: position.y, left: position.x }),
  };

  return <div className="wt-stage-slot" data-vt-name={target} style={style} />;
}
