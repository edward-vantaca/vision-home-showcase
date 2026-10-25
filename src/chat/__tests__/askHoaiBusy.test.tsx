import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, act, fireEvent } from "@testing-library/react";
import gsap from "gsap";
import AskHoaiPanel from "../AskHoaiPanel";
import { isWalkthroughBusy } from "../../walkthrough/cursor";

describe("AskHoaiPanel scripted chat holds the walkthrough busy", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval"] });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
    gsap.killTweensOf("*");
  });

  function renderAndSend(focused = true) {
    const utils = render(<AskHoaiPanel open focused={focused} onCollapse={() => {}} />);
    const textarea = utils.container.querySelector<HTMLTextAreaElement>('[data-vt-name="wt-askhoai-input"]')!;
    fireEvent.change(textarea, { target: { value: "Can I replace my fence?" } });
    act(() => {
      utils.container.querySelector<HTMLButtonElement>('[data-vt-name="wt-askhoai-send-btn"]')!.click();
    });
    return utils;
  }

  it("holds busy from Send until the acknowledgement finishes streaming", () => {
    const { container, getByText, unmount } = renderAndSend();
    try {
      expect(isWalkthroughBusy()).toBe(true);
      // Complete the welcome -> thread morph so the thread view mounts.
      const welcome = container.querySelector('[data-ash-section="welcome"]');
      const questions = container.querySelector('[data-ash-section="questions"]');
      act(() => {
        gsap.getTweensOf([welcome, questions]).forEach((t) => t.progress(1));
      });
      act(() => {
        vi.advanceTimersByTime(20_000);
      });
      expect(getByText("Ok, I'll get started. Just a moment.")).toBeInTheDocument();
      expect(isWalkthroughBusy()).toBe(false);
    } finally {
      unmount();
    }
  });

  it("stopScript releases", () => {
    const { rerender, unmount } = renderAndSend();
    try {
      expect(isWalkthroughBusy()).toBe(true);
      rerender(<AskHoaiPanel open focused={false} onCollapse={() => {}} />);
      expect(isWalkthroughBusy()).toBe(false);
    } finally {
      unmount();
    }
  });

  it("a manual Send in the sidebar (not focused) takes no hold", () => {
    const { unmount } = renderAndSend(false);
    try {
      expect(isWalkthroughBusy()).toBe(false);
    } finally {
      unmount();
    }
  });
});
