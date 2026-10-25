import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, act, fireEvent, cleanup } from "@testing-library/react";
import PhoneStage, { ANSWER_AT_MS, NOTIFICATION_DELAY_MS, SMS_SCENE_ID } from "../PhoneStage";
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
      { kind: "cursor", to: VT.SmsNotification, action: "click" },
      { kind: "cursor", to: VT.SmsInput, action: "click", typeText: SMS_REPLY },
      { kind: "cursor", to: VT.SmsSendBtn, action: "click" },
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

/** Lands forward on beat 3 and lets the send script finish. */
function settleOnBeat3(c: HTMLElement) {
  jump(3);
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
    settleOnBeat3(container);
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
    expect(n.textContent).toContain("Waterfront Community Estates");
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

  it("the lock-screen notification shows the warning up to 'flooding is possible.'", () => {
    const { container } = renderStage();
    jump(1);
    const preview = q(container, VT.SmsNotification)!.querySelector(".sms-notification-preview")!;
    expect(preview.textContent).toBe(SMS_PREVIEW);
    expect(SMS_PREVIEW).toMatch(/Local flooding is possible\.$/);
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

  it("opening the thread shows the broadcast without an unheld entrance animation", () => {
    const { container } = renderStage();
    jump(1);
    act(() => q(container, VT.SmsNotification)!.click());
    const bubble = container.querySelector("[data-sms-bubble]")!;
    expect(bubble.classList.contains("sms-bubble-in")).toBe(false);
    expect(isWalkthroughBusy()).toBe(false);
  });

  it("the input is controlled by the draft", () => {
    const { container } = renderStage();
    jump(2);
    const input = q(container, VT.SmsInput) as HTMLInputElement;
    expect(input.value).toBe("");
    fireEvent.change(input, { target: { value: "Hi" } });
    expect((q(container, VT.SmsInput) as HTMLInputElement).value).toBe("Hi");
  });

  it("send shows typing dots then the answer and releases busy", () => {
    const { container, getByText, queryByText, queryByLabelText } = renderStage();
    jump(3);
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
    expect(isWalkthroughBusy()).toBe(false);
    expect(container.querySelectorAll("[data-sms-bubble]").length).toBe(1);
  });

  it("back from beat 3 to beat 2 restores the typed reply", () => {
    const { container, queryByText } = renderStage();
    settleOnBeat3(container);
    act(() => nav.back());
    expect(nav.cursor).toEqual({ sceneIndex: 1, beatIndex: 2 });
    expect((q(container, VT.SmsInput) as HTMLInputElement).value).toBe(SMS_REPLY);
    expect(queryByText(SMS_ANSWER)).toBeNull();
  });

  it("a cursor change mid-reply stops the script and releases busy", () => {
    const { container, queryByText } = renderStage();
    jump(3);
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
    settleOnBeat3(container);
    expect(container.textContent).toContain(SMS_ANSWER);
    expect(container.textContent).not.toMatch(/hoai/i);
  });

  it("unmount releases", () => {
    const { container, unmount } = renderStage();
    jump(3);
    act(() => q(container, VT.SmsSendBtn)!.click());
    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(isWalkthroughBusy()).toBe(true);
    unmount();
    expect(isWalkthroughBusy()).toBe(false);
  });
});
