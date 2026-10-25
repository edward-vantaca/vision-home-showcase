import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, act, fireEvent, cleanup } from "@testing-library/react";
import PhoneStage, { ANSWER_AT_MS, SMS_SCENE_ID } from "../PhoneStage";
import { SMS_ANSWER, SMS_BROADCAST, SMS_REPLY } from "../phoneState";
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

function renderStage() {
  return render(
    <WalkthroughProvider sequence={seq}>
      <PhoneStage />
      <Probe />
    </WalkthroughProvider>,
  );
}

const q = (c: HTMLElement, name: string) => c.querySelector<HTMLElement>(`[data-vt-name="${name}"]`);

function jump(beatIndex: number) {
  act(() => nav.jumpTo({ sceneIndex: 1, beatIndex }));
}

function finishNotification(c: HTMLElement) {
  const n = q(c, VT.SmsNotification);
  if (n) fireEvent.animationEnd(n);
}

/** Lands forward on beat 4 and lets the send script finish. */
function settleOnBeat4(c: HTMLElement) {
  jump(4);
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
    settleOnBeat4(container);
    expect(getByText(SMS_ANSWER)).toBeInTheDocument();
    act(() => nav.advance());
    expect(nav.sceneId).toBe("after");
    expect(getByText(SMS_ANSWER)).toBeInTheDocument();
  });

  it("beat 0 is a lock screen with no notification", () => {
    const { container, getByText } = renderStage();
    jump(0);
    expect(getByText("4:12")).toBeInTheDocument();
    expect(getByText("Sunday, October 25")).toBeInTheDocument();
    expect(q(container, VT.SmsNotification)).toBeNull();
  });

  it("beat 1 shows the notification from the sender", () => {
    const { container } = renderStage();
    jump(0);
    act(() => nav.advance());
    const n = q(container, VT.SmsNotification)!;
    expect(n.textContent).toContain("Waterfront Community Estates");
    expect(isWalkthroughBusy()).toBe(true);
    fireEvent.animationEnd(n);
    expect(isWalkthroughBusy()).toBe(false);
  });

  it("beat 1 releases busy after 700ms if animationend never fires", () => {
    renderStage();
    jump(1);
    expect(isWalkthroughBusy()).toBe(true);
    act(() => {
      vi.advanceTimersByTime(699);
    });
    expect(isWalkthroughBusy()).toBe(true);
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(isWalkthroughBusy()).toBe(false);
  });

  it("clicking the notification opens the thread with the broadcast", () => {
    const { container, getByText } = renderStage();
    jump(2);
    finishNotification(container);
    act(() => q(container, VT.SmsNotification)!.click());
    expect(q(container, VT.SmsNotification)).toBeNull();
    expect(getByText(SMS_BROADCAST)).toBeInTheDocument();
    expect(q(container, VT.SmsInput)).not.toBeNull();
  });

  it("opening the thread shows the broadcast without an unheld entrance animation", () => {
    const { container } = renderStage();
    jump(2);
    finishNotification(container);
    act(() => q(container, VT.SmsNotification)!.click());
    const bubble = container.querySelector("[data-sms-bubble]")!;
    expect(bubble.classList.contains("sms-bubble-in")).toBe(false);
    expect(isWalkthroughBusy()).toBe(false);
  });

  it("the input is controlled by the draft", () => {
    const { container } = renderStage();
    jump(3);
    const input = q(container, VT.SmsInput) as HTMLInputElement;
    expect(input.value).toBe("");
    fireEvent.change(input, { target: { value: "Hi" } });
    expect((q(container, VT.SmsInput) as HTMLInputElement).value).toBe("Hi");
  });

  it("send shows typing dots then the answer and releases busy", () => {
    const { container, getByText, queryByText, queryByLabelText } = renderStage();
    jump(4);
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
    jump(2);
    finishNotification(container);
    act(() => q(container, VT.SmsNotification)!.click());
    act(() => q(container, VT.SmsSendBtn)!.click());
    expect(isWalkthroughBusy()).toBe(false);
    expect(container.querySelectorAll("[data-sms-bubble]").length).toBe(1);
  });

  it("back from beat 4 to beat 3 restores the typed reply", () => {
    const { container, queryByText } = renderStage();
    settleOnBeat4(container);
    act(() => nav.back());
    expect(nav.cursor).toEqual({ sceneIndex: 1, beatIndex: 3 });
    expect((q(container, VT.SmsInput) as HTMLInputElement).value).toBe(SMS_REPLY);
    expect(queryByText(SMS_ANSWER)).toBeNull();
  });

  it("a cursor change mid-reply stops the script and releases busy", () => {
    const { container, queryByText } = renderStage();
    jump(4);
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
    settleOnBeat4(container);
    expect(container.textContent).toContain(SMS_ANSWER);
    expect(container.textContent).not.toMatch(/hoai/i);
  });

  it("unmount releases", () => {
    const { container, unmount } = renderStage();
    jump(4);
    act(() => q(container, VT.SmsSendBtn)!.click());
    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(isWalkthroughBusy()).toBe(true);
    unmount();
    expect(isWalkthroughBusy()).toBe(false);
  });
});
