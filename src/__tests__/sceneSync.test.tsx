import { describe, expect, it } from "vitest";
import { act, fireEvent, render } from "@testing-library/react";
import gsap from "gsap";
import App from "../App";
import { WalkthroughProvider, isWalkthroughBusy, useCursor } from "../walkthrough/cursor";
import { SMS_SCENE_ID } from "../walkthrough/phone/PhoneStage";
import type { Sequence } from "../walkthrough/types";

const portal = { phase: "portal", page: "dashboard", dashboardView: "homeowner", askHoaiOpen: true } as const;

// Two scenes on the same page: the second must still pull the app back there.
const seq: Sequence = [
  { id: "first", page: "dashboard", appState: portal, beats: [{ kind: "idle" }] },
  { id: "second", page: "dashboard", appState: portal, beats: [{ kind: "idle" }] },
];

function Next() {
  const { advance } = useCursor();
  return <button type="button" data-testid="next" onClick={advance}>next</button>;
}

function Back() {
  const { back } = useCursor();
  return <button type="button" data-testid="back" onClick={back}>back</button>;
}

function q(container: HTMLElement, uxId: string) {
  return container.querySelector<HTMLElement>(`[data-ux-id="${uxId}"]`);
}

describe("MainApp scene sync", () => {
  it("each scene change returns to the scene's page and closes Quick Actions", () => {
    const { container, getByTestId } = render(
      <WalkthroughProvider sequence={seq}>
        <App />
        <Next />
      </WalkthroughProvider>,
    );

    fireEvent.click(q(container, "sidebar-quick-actions")!);
    fireEvent.click(q(container, "sidebar-quick-actions-arc-request")!);
    fireEvent.click(q(container, "quick-actions-arc-form-fence")!);
    expect(q(container, "arc-form-page")).not.toBeNull();

    fireEvent.click(q(container, "sidebar-quick-actions")!);
    expect(q(container, "quick-actions-modal")).not.toBeNull();

    act(() => {
      fireEvent.click(getByTestId("next"));
    });
    expect(q(container, "arc-form-page")).toBeNull();
    expect(q(container, "dashboard-page")).not.toBeNull();
    expect(q(container, "quick-actions-modal")).toBeNull();
  });

  it("keeps the Ask HOAi panel focused only on the broadcast SMS scene's first beat", () => {
    const smsSeq: Sequence = [
      { id: "ask-hoai", page: "dashboard", appState: portal, beats: [{ kind: "idle" }] },
      { id: SMS_SCENE_ID, page: "dashboard", appState: portal, beats: [{ kind: "idle" }, { kind: "idle" }] },
    ];
    const { container, getByTestId } = render(
      <WalkthroughProvider sequence={smsSeq}>
        <App />
        <Next />
      </WalkthroughProvider>,
    );
    const panel = () => q(container, "askhoai-panel")!;
    const isFocused = () => panel().className.includes("left-1/2");

    expect(isFocused()).toBe(true);
    act(() => {
      fireEvent.click(getByTestId("next"));
    });
    // Beat 0: the panel slides out with the app still in its focused form.
    expect(isFocused()).toBe(true);
    act(() => {
      fireEvent.click(getByTestId("next"));
    });
    // Beat 1: it morphs back to the sidebar off-screen.
    expect(isFocused()).toBe(false);
  });

  it("← from the SMS scene's first beat hard-cuts ask-hoai back to a fresh welcome view", () => {
    const smsSeq: Sequence = [
      { id: "ask-hoai", page: "dashboard", appState: portal, beats: [{ kind: "idle" }] },
      { id: SMS_SCENE_ID, page: "dashboard", appState: portal, beats: [{ kind: "idle" }, { kind: "idle" }] },
    ];
    const { container, getByTestId, unmount } = render(
      <WalkthroughProvider sequence={smsSeq}>
        <App />
        <Next />
        <Back />
      </WalkthroughProvider>,
    );
    try {
      const panel = () => q(container, "askhoai-panel")!;
      const section = (name: string) => panel().querySelector(`[data-ash-section="${name}"]`);

      // Start the scripted chat and let the welcome -> thread morph commit.
      const textarea = panel().querySelector<HTMLTextAreaElement>('[data-vt-name="wt-askhoai-input"]')!;
      fireEvent.change(textarea, { target: { value: "Can I replace my fence?" } });
      act(() => {
        panel().querySelector<HTMLButtonElement>('[data-vt-name="wt-askhoai-send-btn"]')!.click();
      });
      act(() => {
        gsap.getTweensOf([section("welcome"), section("questions")]).forEach((t) => t.progress(1));
      });
      expect(section("thread")).not.toBeNull();

      act(() => {
        fireEvent.click(getByTestId("next"));
      });
      // Beat 0: still focused, conversation untouched mid-swipe.
      expect(section("thread")).not.toBeNull();

      act(() => {
        fireEvent.click(getByTestId("back"));
      });
      expect(section("thread")).toBeNull();
      expect(section("welcome")).not.toBeNull();
      expect(panel().textContent).not.toContain("Can I replace my fence?");
      expect(isWalkthroughBusy()).toBe(false);
    } finally {
      unmount();
    }
  });
});
