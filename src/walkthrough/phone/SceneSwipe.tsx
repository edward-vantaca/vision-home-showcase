import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { holdBusy, useCursor } from "../cursor";
import PhoneStage, { SMS_SCENE_ID } from "./PhoneStage";

/** How long the app ⇄ phone swipe takes, both ways. */
export const SWIPE_MS = 1200;
const SWIPE_TRANSITION = `transform ${SWIPE_MS}ms cubic-bezier(0.4,0,0.2,1)`;
const SWIPE_FALLBACK_MS = 1500;

/** Where the app sits and whether the move animates. */
export function swipeFor(
  prevSceneId: string | undefined,
  sceneId: string | undefined,
  direction: "forward" | "back",
): { offset: "none" | "out"; animate: boolean } {
  const offset = sceneId === SMS_SCENE_ID ? "out" : "none";
  const animate =
    direction === "forward" &&
    ((prevSceneId === "ask-hoai" && sceneId === SMS_SCENE_ID) ||
      (prevSceneId === SMS_SCENE_ID && sceneId === "closing-dashboard"));
  return { offset, animate };
}

/**
 * Follows scene changes and reports the swipe: where to sit and whether a
 * swipe is in flight. In flight from the scene change until this element's
 * own `transitionend` for `transform` (or the fallback timeout). With
 * `holdKeys`, presenter keys are held while it's in flight.
 */
function useSwipe(holdKeys: boolean) {
  const { sceneId, direction } = useCursor();
  // Updated after each scene change, so during the render that first sees a
  // new scene it still names the one we came from.
  const prevSceneId = useRef(sceneId);
  const { offset, animate } = swipeFor(prevSceneId.current, sceneId, direction);
  const [moving, setMoving] = useState(false);

  // Keyed on the scene only: `animate` is this render's value, so a
  // StrictMode re-run sees the same one even though the ref has moved on.
  useLayoutEffect(() => {
    setMoving(animate);
    prevSceneId.current = sceneId;
  }, [sceneId]);

  useEffect(() => {
    if (!moving) return;
    const release = holdKeys ? holdBusy() : () => {};
    const timer = setTimeout(() => setMoving(false), SWIPE_FALLBACK_MS);
    return () => {
      clearTimeout(timer);
      release();
    };
  }, [moving, holdKeys]);

  // Native listener: React maps onTransitionEnd to a vendor-prefixed event
  // where TransitionEvent is missing (jsdom), so listen for the standard one.
  const ref = useCallback((el: HTMLElement | null) => {
    if (!el) return;
    const onEnd = (e: Event) => {
      if (e.target === el && (e as TransitionEvent).propertyName === "transform") setMoving(false);
    };
    el.addEventListener("transitionend", onEnd);
    return () => el.removeEventListener("transitionend", onEnd);
  }, []);

  return { offset, inFlight: animate || moving, ref };
}

/**
 * Wraps the app. Slides it off to the left for the SMS scene. Outside that
 * scene and with no swipe in flight its transform is `none`: a transform
 * would trap the app's `position: fixed` children (lifts, the payment modal).
 */
export function AppSlide({ children }: { children: ReactNode }) {
  const { offset, inFlight, ref } = useSwipe(true);
  const transform = offset === "out" ? "translateX(-100%)" : inFlight ? "translateX(0)" : "none";
  return (
    <div
      ref={ref}
      className="wt-app-slide"
      style={{ transform, transition: inFlight ? SWIPE_TRANSITION : undefined }}
    >
      {children}
    </div>
  );
}

/** White full-screen layer holding the phone; slides in from the right in lockstep with the app. */
export function PhoneLayer() {
  const { offset, inFlight, ref } = useSwipe(false);
  const offScreen = offset === "none" && !inFlight;
  // Read by the phone when it lands, so its notification waits for the swipe.
  const swipeInMs = offset === "out" && inFlight ? SWIPE_MS : 0;
  return (
    <div
      ref={ref}
      className="wt-phone-layer"
      aria-hidden={offScreen || undefined}
      style={{
        transform: offset === "out" ? "translateX(0)" : "translateX(100%)",
        transition: inFlight ? SWIPE_TRANSITION : undefined,
        visibility: offScreen ? "hidden" : undefined,
        pointerEvents: offScreen ? "none" : undefined,
      }}
    >
      <PhoneStage swipeInMs={swipeInMs} />
    </div>
  );
}
