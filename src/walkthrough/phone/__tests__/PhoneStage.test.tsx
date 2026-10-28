import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, act, fireEvent, cleanup } from "@testing-library/react";
import PhoneStage, { ANSWER_AT_MS, NOTIFICATION_DELAY_MS, SMS_SCENE_ID, THREAD_HOLD_FALLBACK_MS } from "../PhoneStage";
import { SMS_ANSWER, SMS_BROADCAST, SMS_PREVIEW, SMS_REPLY } from "../phoneState";
import { SWIPE_MS } from "../SceneSwipe";
import { WalkthroughProvider, isWalkthroughBusy, useCursor } from "../../cursor";
import { VT } from "../../viewTransitionNames";
import type { Sequence } from "../../types";

const seq: Sequence = [
  { id: "before", page: "dashboard", beats: [{ kind: "idle" }] },
  {
    id: SMS_SCENE_ID,
    page: "dashboard",
    beats: [
      { kind: "idle" },
      {
        kind: "cursor",
        to: VT.SmsNotification,
        action: "click",
        then: [
          { to: VT.SmsInput, action: "click", typeText: SMS_REPLY },
          { to: VT.SmsSendBtn, action: "click" },
        ],
      },
    ],
  },
  { id: "after", page: "dashboard", beats: [{ kind: "idle" }] },
];

let nav: ReturnType<typeof useCursor>;

function Probe() {
  nav = useCursor();
  return null;
}

function renderStage(swipeInMs?: number) {
  return render(
    <WalkthroughProvider sequence={seq}>
      <PhoneStage swipeInMs={swipeInMs} />
      <Probe />
    </WalkthroughProvider>,
  );
}

const q = (c: HTMLElement, name: string) => c.querySelector<HTMLElement>(`[data-vt-name="${name}"]`);

function jump(beatIndex: number) {
  act(() => nav.jumpTo({ sceneIndex: 1, beatIndex }));
}

const advanceBy = (ms: number) =>
  act(() => {
    vi.advanceTimersByTime(ms);
  });

/** Does what beat 1's cursor does by hand: tap the notification, type the reply. */
function tapAndType(c: HTMLElement) {
  jump(1);
  act(() => q(c, VT.SmsNotification)!.click());
  fireEvent.change(q(c, VT.SmsInput)!, { target: { value: SMS_REPLY } });
}

/** Lands forward on beat 1 and plays it through to the answer. */
function settleOnBeat1(c: HTMLElement) {
  tapAndType(c);
  act(() => q(c, VT.SmsSendBtn)!.click());
  act(() => {
    vi.advanceTimersByTime(ANSWER_AT_MS);
  });
}

describe("PhoneStage", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it("keeps its last state after leaving the scene", () => {
    const { container, getByText } = renderStage();
    settleOnBeat1(container);
    expect(getByText(SMS_ANSWER)).toBeInTheDocument();
    act(() => nav.advance());
    expect(nav.sceneId).toBe("after");
    expect(getByText(SMS_ANSWER)).toBeInTheDocument();
  });

  it("forward onto beat 0 shows the lock screen with no notification and holds busy", () => {
    const { container, getByText } = renderStage();
    jump(0);
    expect(getByText("4:12")).toBeInTheDocument();
    expect(getByText("Sunday, October 25")).toBeInTheDocument();
    expect(q(container, VT.SmsNotification)).toBeNull();
    expect(isWalkthroughBusy()).toBe(true);
  });

  it("a hard cut onto beat 0 drops the notification in 500ms after landing", () => {
    const { container } = renderStage();
    jump(0);
    advanceBy(NOTIFICATION_DELAY_MS - 1);
    expect(q(container, VT.SmsNotification)).toBeNull();
    expect(isWalkthroughBusy()).toBe(true);
    advanceBy(1);
    const n = q(container, VT.SmsNotification)!;
    expect(n.querySelector(".sms-notification-sender")?.textContent).toBe("Waterfront Estates");
    expect(n.classList.contains("sms-notification-in")).toBe(true);
    expect(isWalkthroughBusy()).toBe(true);
    fireEvent.animationEnd(n);
    expect(isWalkthroughBusy()).toBe(false);
  });

  it("a swipe in drops the notification 500ms after the swipe lands, holding busy throughout", () => {
    const { container } = renderStage(SWIPE_MS);
    jump(0);
    expect(isWalkthroughBusy()).toBe(true);
    advanceBy(SWIPE_MS + NOTIFICATION_DELAY_MS - 1);
    expect(q(container, VT.SmsNotification)).toBeNull();
    expect(isWalkthroughBusy()).toBe(true);
    advanceBy(1);
    const n = q(container, VT.SmsNotification)!;
    expect(n.classList.contains("sms-notification-in")).toBe(true);
    expect(isWalkthroughBusy()).toBe(true);
    fireEvent.animationEnd(n);
    expect(isWalkthroughBusy()).toBe(false);
  });

  it("releases busy 700ms after the drop if animationend never fires", () => {
    const { container } = renderStage();
    jump(0);
    advanceBy(NOTIFICATION_DELAY_MS);
    expect(q(container, VT.SmsNotification)).not.toBeNull();
    advanceBy(699);
    expect(isWalkthroughBusy()).toBe(true);
    advanceBy(1);
    expect(isWalkthroughBusy()).toBe(false);
  });

  it("back from beat 1 shows the notification at once, with no animation and no hold", () => {
    const { container } = renderStage();
    jump(1);
    act(() => nav.back());
    expect(nav.cursor).toEqual({ sceneIndex: 1, beatIndex: 0 });
    const n = q(container, VT.SmsNotification)!;
    expect(n).not.toBeNull();
    expect(n.classList.contains("sms-notification-in")).toBe(false);
    expect(isWalkthroughBusy()).toBe(false);
  });

  it("leaving the scene before the drop cancels it and releases the hold", () => {
    const { container } = renderStage();
    jump(0);
    expect(isWalkthroughBusy()).toBe(true);
    act(() => nav.jumpTo({ sceneIndex: 2, beatIndex: 0 }));
    expect(isWalkthroughBusy()).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
    advanceBy(2000);
    expect(q(container, VT.SmsNotification)).toBeNull();
  });

  it("unmounting before the drop cancels it and releases the hold", () => {
    const { unmount } = renderStage();
    jump(0);
    expect(isWalkthroughBusy()).toBe(true);
    unmount();
    expect(isWalkthroughBusy()).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("forward onto beat 1 shows the notification without animating or holding", () => {
    const { container } = renderStage();
    jump(1);
    const n = q(container, VT.SmsNotification)!;
    expect(n).not.toBeNull();
    expect(n.classList.contains("sms-notification-in")).toBe(false);
    expect(isWalkthroughBusy()).toBe(false);
  });

  it("the lock-screen notification shows the closure up to 'planned maintenance.'", () => {
    const { container } = renderStage();
    jump(1);
    const preview = q(container, VT.SmsNotification)!.querySelector(".sms-notification-preview")!;
    expect(preview.textContent).toBe(SMS_PREVIEW);
    expect(SMS_PREVIEW).toMatch(/clubhouse.*closed.*for planned maintenance\.$/i);
    expect(SMS_BROADCAST.startsWith(SMS_PREVIEW)).toBe(true);
  });

  it("clicking the notification opens the thread with the broadcast", () => {
    const { container, getByText } = renderStage();
    jump(1);
    act(() => q(container, VT.SmsNotification)!.click());
    expect(q(container, VT.SmsNotification)).toBeNull();
    expect(getByText(SMS_BROADCAST)).toBeInTheDocument();
    expect(q(container, VT.SmsInput)).not.toBeNull();
  });

  it("opening the thread shows the broadcast without an entrance animation", () => {
    const { container } = renderStage();
    jump(1);
    act(() => q(container, VT.SmsNotification)!.click());
    const bubble = container.querySelector("[data-sms-bubble]")!;
    expect(bubble.classList.contains("sms-bubble-in")).toBe(false);
  });

  it("the scripted tap holds keys while the reply is typed, until the answer arrives", () => {
    const { container, getByText } = renderStage();
    tapAndType(container);
    expect(isWalkthroughBusy()).toBe(true);
    act(() => q(container, VT.SmsSendBtn)!.click());
    expect(isWalkthroughBusy()).toBe(true);
    advanceBy(ANSWER_AT_MS);
    expect(getByText(SMS_ANSWER)).toBeInTheDocument();
    expect(isWalkthroughBusy()).toBe(false);
  });

  it("releases the tap's hold after THREAD_HOLD_FALLBACK_MS if the reply is never sent", () => {
    const { container } = renderStage();
    jump(1);
    act(() => q(container, VT.SmsNotification)!.click());
    advanceBy(THREAD_HOLD_FALLBACK_MS - 1);
    expect(isWalkthroughBusy()).toBe(true);
    advanceBy(1);
    expect(isWalkthroughBusy()).toBe(false);
  });

  it("a hand tap on beat 0 opens the thread without holding keys", () => {
    const { container } = renderStage();
    jump(1);
    act(() => nav.back());
    act(() => q(container, VT.SmsNotification)!.click());
    expect(q(container, VT.SmsInput)).not.toBeNull();
    expect(isWalkthroughBusy()).toBe(false);
  });

  it("the input is controlled by the draft", () => {
    const { container } = renderStage();
    jump(1);
    act(() => q(container, VT.SmsNotification)!.click());
    const input = q(container, VT.SmsInput) as HTMLInputElement;
    expect(input.value).toBe("");
    fireEvent.change(input, { target: { value: "Hi" } });
    expect((q(container, VT.SmsInput) as HTMLInputElement).value).toBe("Hi");
  });

  it("the input grows to fit the whole draft as it is typed", () => {
    const { container } = renderStage();
    jump(1);
    act(() => q(container, VT.SmsNotification)!.click());
    const input = q(container, VT.SmsInput) as HTMLTextAreaElement;
    expect(input.tagName).toBe("TEXTAREA");
    Object.defineProperty(input, "scrollHeight", { configurable: true, get: () => (input.value ? 48 : 20) });
    fireEvent.change(input, { target: { value: SMS_REPLY } });
    expect(input.style.height).toBe("48px");
    fireEvent.change(input, { target: { value: "" } });
    expect(input.style.height).toBe("20px");
  });

  it("send shows typing dots then the answer and releases busy", () => {
    const { container, getByText, queryByText, queryByLabelText } = renderStage();
    tapAndType(container);
    expect((q(container, VT.SmsInput) as HTMLInputElement).value).toBe(SMS_REPLY);
    act(() => q(container, VT.SmsSendBtn)!.click());
    expect(isWalkthroughBusy()).toBe(true);
    expect(getByText(SMS_REPLY)).toBeInTheDocument();
    expect((q(container, VT.SmsInput) as HTMLInputElement).value).toBe("");
    expect(queryByLabelText("Typing")).toBeNull();
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(queryByLabelText("Typing")).not.toBeNull();
    expect(queryByText(SMS_ANSWER)).toBeNull();
    expect(isWalkthroughBusy()).toBe(true);
    act(() => {
      vi.advanceTimersByTime(1400);
    });
    expect(getByText(SMS_ANSWER)).toBeInTheDocument();
    expect(queryByLabelText("Typing")).toBeNull();
    expect(isWalkthroughBusy()).toBe(false);
  });

  it("send with an empty draft does nothing", () => {
    const { container } = renderStage();
    jump(1);
    act(() => q(container, VT.SmsNotification)!.click());
    act(() => q(container, VT.SmsSendBtn)!.click());
    expect(container.querySelectorAll("[data-sms-bubble]").length).toBe(1);
    expect(container.textContent).not.toContain(SMS_ANSWER);
  });

  it("back from the next scene shows the lock screen with the notification, ready to replay", () => {
    const { container, queryByText } = renderStage();
    settleOnBeat1(container);
    act(() => nav.advance());
    act(() => nav.back());
    expect(nav.cursor).toEqual({ sceneIndex: 1, beatIndex: 1 });
    expect(q(container, VT.SmsNotification)).not.toBeNull();
    expect(queryByText(SMS_ANSWER)).toBeNull();
  });

  it("a cursor change mid-reply stops the script and releases busy", () => {
    const { container, queryByText } = renderStage();
    tapAndType(container);
    act(() => q(container, VT.SmsSendBtn)!.click());
    expect(isWalkthroughBusy()).toBe(true);
    act(() => nav.back());
    expect(isWalkthroughBusy()).toBe(false);
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(queryByText(SMS_ANSWER)).toBeNull();
  });

  it("never shows HOAi branding", () => {
    const { container } = renderStage();
    settleOnBeat1(container);
    expect(container.textContent).toContain(SMS_ANSWER);
    expect(container.textContent).not.toMatch(/hoai/i);
  });

  it("unmount releases", () => {
    const { container, unmount } = renderStage();
    tapAndType(container);
    act(() => q(container, VT.SmsSendBtn)!.click());
    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(isWalkthroughBusy()).toBe(true);
    unmount();
    expect(isWalkthroughBusy()).toBe(false);
  });
});
