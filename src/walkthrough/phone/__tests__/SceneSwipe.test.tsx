import { StrictMode } from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, act, fireEvent, cleanup } from "@testing-library/react";
import { AppSlide, PhoneLayer, SWIPE_MS, swipeFor } from "../SceneSwipe";
import { NOTIFICATION_DELAY_MS, SMS_SCENE_ID } from "../PhoneStage";
import { VT } from "../../viewTransitionNames";
import { WalkthroughProvider, isWalkthroughBusy, useCursor } from "../../cursor";
import type { Sequence } from "../../types";

// Generic neighbours: the swipe must not depend on which scenes surround the phone.
const phoneScene: Sequence[number] = {
  id: SMS_SCENE_ID,
  page: "dashboard",
  stage: "phone",
  beats: [{ kind: "idle" }, { kind: "idle" }],
};
const seq: Sequence = [
  { id: "far", page: "dashboard", beats: [{ kind: "idle" }] },
  { id: "before", page: "dashboard", beats: [{ kind: "idle" }, { kind: "idle" }] },
  phoneScene,
  { id: "after", page: "dashboard", beats: [{ kind: "idle" }] },
];

let nav: ReturnType<typeof useCursor>;

function Probe() {
  nav = useCursor();
  return null;
}

// Without the phone, the only hold is the swipe's own (landing forward on the
// SMS scene's beat 0 also holds busy until the notification has dropped in).
function renderSwipe({ withPhone = true, sequence = seq } = {}) {
  const utils = render(
    <StrictMode>
      <WalkthroughProvider sequence={sequence}>
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

// Lets every in-flight swipe, notification drop and their holds run out.
const settle = () =>
  act(() => {
    vi.advanceTimersByTime(5000);
  });

describe("swipeFor", () => {
  const app = { isPhone: false };
  const phone = { isPhone: true };

  it("first render: sits where the scene says, no animation", () => {
    expect(swipeFor(undefined, false)).toEqual({ offset: "none", animate: false });
    expect(swipeFor(undefined, true)).toEqual({ offset: "out", animate: false });
  });

  it("entering a phone scene slides out", () => {
    expect(swipeFor(app, true)).toEqual({ offset: "out", animate: true });
  });

  it("leaving a phone scene slides back in", () => {
    expect(swipeFor(phone, false)).toEqual({ offset: "none", animate: true });
  });

  it("staying within the same kind of scene doesn't animate", () => {
    expect(swipeFor(app, false)).toEqual({ offset: "none", animate: false });
    expect(swipeFor(phone, true)).toEqual({ offset: "out", animate: false });
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

  it("the swipe is a 600ms decelerating slide", () => {
    expect(SWIPE_MS).toBe(600);
    const { wrapper, layer } = renderSwipe();
    jump(1, 1);
    act(() => nav.advance());
    expect(nav.sceneId).toBe(SMS_SCENE_ID);
    expect(wrapper.style.transform).toBe("translateX(-100%)");
    expect(wrapper.style.transition).toBe("transform 600ms cubic-bezier(0.4,0,0.2,1)");
    expect(layer.style.transform).toBe("translateX(0)");
    expect(layer.style.transition).toBe("transform 600ms cubic-bezier(0.4,0,0.2,1)");
    expect(layer.style.visibility).not.toBe("hidden");
  });

  it("swipe holds busy until the transition ends", () => {
    const { wrapper } = renderSwipe({ withPhone: false });
    jump(1, 1);
    act(() => nav.advance());
    expect(isWalkthroughBusy()).toBe(true);
    act(() => {
      fireEvent.transitionEnd(wrapper, { propertyName: "opacity" });
    });
    expect(isWalkthroughBusy()).toBe(true);
    endTransform(wrapper);
    expect(isWalkthroughBusy()).toBe(false);
  });

  it("releases the hold after 900ms if no transitionend arrives", () => {
    renderSwipe({ withPhone: false });
    jump(1, 1);
    act(() => nav.advance());
    act(() => {
      vi.advanceTimersByTime(899);
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
    jump(1, 1);
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
    jump(2, 1);
    settle();
    expect(isWalkthroughBusy()).toBe(false);
    expect(wrapper.style.transform).toBe("translateX(-100%)");
    act(() => nav.advance());
    expect(nav.sceneId).toBe("after");
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

  it("a launcher jump from a non-adjacent scene into the phone scene slides and holds busy", () => {
    const { wrapper } = renderSwipe({ withPhone: false });
    expect(nav.sceneId).toBe("far");
    jump(2, 0);
    expect(wrapper.style.transform).toBe("translateX(-100%)");
    expect(wrapper.style.transition).toBe("transform 600ms cubic-bezier(0.4,0,0.2,1)");
    expect(isWalkthroughBusy()).toBe(true);
    endTransform(wrapper);
    expect(isWalkthroughBusy()).toBe(false);
  });

  it("← from the scene after the phone back into it slides", () => {
    const { wrapper } = renderSwipe({ withPhone: false });
    jump(3, 0);
    settle();
    act(() => nav.back());
    expect(nav.sceneId).toBe(SMS_SCENE_ID);
    expect(nav.cursor.beatIndex).toBe(1);
    expect(wrapper.style.transform).toBe("translateX(-100%)");
    expect(wrapper.style.transition).toBe("transform 600ms cubic-bezier(0.4,0,0.2,1)");
    expect(isWalkthroughBusy()).toBe(true);
    endTransform(wrapper);
    expect(isWalkthroughBusy()).toBe(false);
  });

  it("← out of the phone scene to the previous scene slides", () => {
    const { wrapper } = renderSwipe();
    jump(2, 0);
    settle();
    expect(isWalkthroughBusy()).toBe(false);
    act(() => nav.back());
    expect(nav.sceneId).toBe("before");
    expect(wrapper.style.transform).toBe("translateX(0)");
    expect(wrapper.style.transition).toBe("transform 600ms cubic-bezier(0.4,0,0.2,1)");
    expect(isWalkthroughBusy()).toBe(true);
    endTransform(wrapper);
    expect(isWalkthroughBusy()).toBe(false);
    expect(wrapper.style.transform).toBe("none");
  });

  it("moving within the phone scene doesn't slide", () => {
    const { wrapper } = renderSwipe({ withPhone: false });
    jump(2, 0);
    settle();
    act(() => nav.advance());
    expect(nav.cursor).toEqual({ sceneIndex: 2, beatIndex: 1 });
    expect(wrapper.style.transition).toBe("");
    expect(isWalkthroughBusy()).toBe(false);
  });

  it("first mount on a phone scene doesn't animate", () => {
    const { wrapper, layer } = renderSwipe({ withPhone: false, sequence: [phoneScene, seq[3]] });
    expect(nav.sceneId).toBe(SMS_SCENE_ID);
    expect(wrapper.style.transform).toBe("translateX(-100%)");
    expect(wrapper.style.transition).toBe("");
    expect(layer).toBeNull();
    expect(isWalkthroughBusy()).toBe(false);
  });
});
