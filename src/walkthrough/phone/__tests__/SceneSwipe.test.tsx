import { StrictMode } from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, act, fireEvent, cleanup } from "@testing-library/react";
import { AppSlide, PhoneLayer, swipeFor } from "../SceneSwipe";
import { SMS_SCENE_ID } from "../PhoneStage";
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

function renderSwipe() {
  const utils = render(
    <StrictMode>
      <WalkthroughProvider sequence={seq}>
        <AppSlide>
          <div>app</div>
        </AppSlide>
        <PhoneLayer />
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

  it("swipe holds busy until the transition ends", () => {
    const { wrapper, layer } = renderSwipe();
    jump(0, 1);
    act(() => nav.advance());
    expect(nav.sceneId).toBe(SMS_SCENE_ID);
    expect(isWalkthroughBusy()).toBe(true);
    expect(wrapper.style.transform).toBe("translateX(-100%)");
    expect(wrapper.style.transition).toBe("transform 900ms cubic-bezier(0.65,0,0.35,1)");
    expect(layer.style.transform).toBe("translateX(0)");
    expect(layer.style.visibility).not.toBe("hidden");
    act(() => {
      fireEvent.transitionEnd(wrapper, { propertyName: "opacity" });
    });
    expect(isWalkthroughBusy()).toBe(true);
    endTransform(wrapper);
    expect(isWalkthroughBusy()).toBe(false);
  });

  it("releases the hold after 1100ms if no transitionend arrives", () => {
    renderSwipe();
    jump(0, 1);
    act(() => nav.advance());
    act(() => {
      vi.advanceTimersByTime(1099);
    });
    expect(isWalkthroughBusy()).toBe(true);
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(isWalkthroughBusy()).toBe(false);
  });

  it("swipe back clears the transform afterwards", () => {
    const { wrapper, layer } = renderSwipe();
    // Land on the phone with a hard cut (not from ask-hoai, which would swipe).
    jump(2, 0);
    jump(1, 1);
    // Let the phone's own notification drop (its hold, not ours) finish.
    act(() => {
      vi.advanceTimersByTime(1000);
    });
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
