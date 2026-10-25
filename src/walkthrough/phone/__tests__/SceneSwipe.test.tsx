import { StrictMode } from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, act, fireEvent, cleanup } from "@testing-library/react";
import { AppSlide, PhoneLayer, SWIPE_MS, swipeFor } from "../SceneSwipe";
import { NOTIFICATION_DELAY_MS, SMS_SCENE_ID } from "../PhoneStage";
import { VT } from "../../viewTransitionNames";
import { WalkthroughProvider, isWalkthroughBusy, useCursor } from "../../cursor";
import type { Sequence } from "../../types";

const seq: Sequence = [
  { id: "ask-hoai", page: "dashboard", beats: [{ kind: "idle" }, { kind: "idle" }] },
  { id: SMS_SCENE_ID, page: "dashboard", beats: [{ kind: "idle" }, { kind: "idle" }] },
  { id: "closing-dashboard", page: "dashboard", beats: [{ kind: "idle" }] },
];

let nav: ReturnType<typeof useCursor>;

function Probe() {
  nav = useCursor();
  return null;
}

// Without the phone, the only hold is the swipe's own (landing forward on the
// SMS scene's beat 0 also holds busy until the notification has dropped in).
function renderSwipe({ withPhone = true } = {}) {
  const utils = render(
    <StrictMode>
      <WalkthroughProvider sequence={seq}>
        <AppSlide>
          <div>app</div>
        </AppSlide>
        {withPhone && <PhoneLayer />}
        <Probe />
      </WalkthroughProvider>
    </StrictMode>,
  );
  const wrapper = utils.container.querySelector<HTMLElement>(".wt-app-slide")!;
  const layer = utils.container.querySelector<HTMLElement>(".wt-phone-layer")!;
  return { ...utils, wrapper, layer };
}

function jump(sceneIndex: number, beatIndex: number) {
  act(() => nav.jumpTo({ sceneIndex, beatIndex }));
}

const endTransform = (el: HTMLElement) =>
  act(() => {
    fireEvent.transitionEnd(el, { propertyName: "transform" });
  });

describe("swipeFor", () => {
  it("swipes out from ask-hoai to the phone, forward", () => {
    expect(swipeFor("ask-hoai", SMS_SCENE_ID, "forward")).toEqual({ offset: "out", animate: true });
  });

  it("swipes back in from the phone to closing-dashboard, forward", () => {
    expect(swipeFor(SMS_SCENE_ID, "closing-dashboard", "forward")).toEqual({ offset: "none", animate: true });
  });

  it("hard-cuts going back onto the phone", () => {
    expect(swipeFor("closing-dashboard", SMS_SCENE_ID, "back")).toEqual({ offset: "out", animate: false });
  });

  it("hard-cuts going back off the phone", () => {
    expect(swipeFor(SMS_SCENE_ID, "ask-hoai", "back")).toEqual({ offset: "none", animate: false });
  });

  it("hard-cuts a launcher jump onto the phone", () => {
    expect(swipeFor("intro", SMS_SCENE_ID, "forward").animate).toBe(false);
  });
});

describe("AppSlide / PhoneLayer", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it("no transform outside the SMS scene", () => {
    const { wrapper, layer } = renderSwipe();
    expect(["", "none"]).toContain(wrapper.style.transform);
    expect(layer.style.visibility).toBe("hidden");
    expect(layer.style.pointerEvents).toBe("none");
  });

  it("the swipe is a 1200ms decelerating slide", () => {
    expect(SWIPE_MS).toBe(1200);
    const { wrapper, layer } = renderSwipe();
    jump(0, 1);
    act(() => nav.advance());
    expect(nav.sceneId).toBe(SMS_SCENE_ID);
    expect(wrapper.style.transform).toBe("translateX(-100%)");
    expect(wrapper.style.transition).toBe("transform 1200ms cubic-bezier(0.4,0,0.2,1)");
    expect(layer.style.transform).toBe("translateX(0)");
    expect(layer.style.transition).toBe("transform 1200ms cubic-bezier(0.4,0,0.2,1)");
    expect(layer.style.visibility).not.toBe("hidden");
  });

  it("swipe holds busy until the transition ends", () => {
    const { wrapper } = renderSwipe({ withPhone: false });
    jump(0, 1);
    act(() => nav.advance());
    expect(isWalkthroughBusy()).toBe(true);
    act(() => {
      fireEvent.transitionEnd(wrapper, { propertyName: "opacity" });
    });
    expect(isWalkthroughBusy()).toBe(true);
    endTransform(wrapper);
    expect(isWalkthroughBusy()).toBe(false);
  });

  it("releases the hold after 1500ms if no transitionend arrives", () => {
    renderSwipe({ withPhone: false });
    jump(0, 1);
    act(() => nav.advance());
    act(() => {
      vi.advanceTimersByTime(1499);
    });
    expect(isWalkthroughBusy()).toBe(true);
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(isWalkthroughBusy()).toBe(false);
  });

  it("swiping in, the notification drops 500ms after the swipe lands with keys held throughout", () => {
    const { wrapper, layer, container } = renderSwipe();
    const notification = () => container.querySelector<HTMLElement>(`[data-vt-name="${VT.SmsNotification}"]`);
    jump(0, 1);
    act(() => nav.advance());
    expect(notification()).toBeNull();
    expect(isWalkthroughBusy()).toBe(true);
    act(() => {
      vi.advanceTimersByTime(SWIPE_MS);
    });
    endTransform(wrapper);
    endTransform(layer);
    expect(isWalkthroughBusy()).toBe(true);
    expect(notification()).toBeNull();
    act(() => {
      vi.advanceTimersByTime(NOTIFICATION_DELAY_MS - 1);
    });
    expect(notification()).toBeNull();
    expect(isWalkthroughBusy()).toBe(true);
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(notification()!.classList.contains("sms-notification-in")).toBe(true);
    expect(isWalkthroughBusy()).toBe(true);
    act(() => {
      fireEvent.animationEnd(notification()!);
    });
    expect(isWalkthroughBusy()).toBe(false);
  });

  it("swipe back clears the transform afterwards", () => {
    const { wrapper, layer } = renderSwipe();
    // Land on the phone's beat 1 with a hard cut (not from ask-hoai, which
    // would swipe; not on beat 0, whose notification drop holds busy).
    jump(2, 0);
    jump(1, 1);
    expect(isWalkthroughBusy()).toBe(false);
    expect(wrapper.style.transform).toBe("translateX(-100%)");
    act(() => nav.advance());
    expect(nav.sceneId).toBe("closing-dashboard");
    expect(isWalkthroughBusy()).toBe(true);
    expect(wrapper.style.transform).toBe("translateX(0)");
    expect(layer.style.transform).toBe("translateX(100%)");
    endTransform(wrapper);
    endTransform(layer);
    expect(isWalkthroughBusy()).toBe(false);
    expect(wrapper.style.transform).toBe("none");
    expect(wrapper.style.transition).toBe("");
    expect(layer.style.visibility).toBe("hidden");
  });

  it("hard-cuts going back off the phone", () => {
    const { wrapper } = renderSwipe();
    jump(2, 0);
    jump(1, 0);
    act(() => nav.back());
    expect(nav.sceneId).toBe("ask-hoai");
    expect(isWalkthroughBusy()).toBe(false);
    expect(wrapper.style.transform).toBe("none");
    expect(wrapper.style.transition).toBe("");
  });
});
