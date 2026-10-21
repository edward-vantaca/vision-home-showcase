import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, act, fireEvent } from "@testing-library/react";
import gsap from "gsap";
import type { ReactNode } from "react";
import AskHoaiPanel from "../AskHoaiPanel";

function panel(props: { open: boolean; focused?: boolean }) {
  const { container } = render(<AskHoaiPanel onCollapse={() => {}} {...props} />);
  return container.querySelector('[data-ux-id="askhoai-panel"]') as HTMLElement;
}

describe("AskHoaiPanel morph forms", () => {
  it("animates all properties with the 700ms lift easing", () => {
    expect(panel({ open: true }).style.transition).toContain("700ms");
  });

  it.each([
    ["sidebar", { open: true }, "left-[calc(100%_-_400px)]"],
    ["collapsed", { open: false }, "left-full"],
    ["focused", { open: true, focused: true }, "left-1/2"],
  ])("%s form is fixed with an explicit left and no right", (_name, props, left) => {
    const classes = panel(props).className.split(/\s+/);
    expect(classes).toContain("fixed");
    expect(classes).toContain(left);
    expect(classes.some((c) => c.startsWith("right-"))).toBe(false);
  });
});

// The walkthrough's CursorBeat drives this exact path: it sets the textarea
// value via the native setter + bubbling input event, then calls `.click()` on
// `[data-vt-name="wt-askhoai-send-btn"]`.
describe("AskHoaiPanel welcome -> thread morph", () => {
  const MSG = "Can I replace my fence?";

  beforeEach(() => {
    // Fake only the scripted-conversation timers; GSAP's rAF ticker stays real
    // (we drive tweens explicitly via progress()).
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval"] });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  function renderAndSend() {
    const utils = render(<AskHoaiPanel open={true} onCollapse={() => {}} focused={true} />);
    const root = utils.container;
    const welcomeEl = root.querySelector<HTMLElement>('[data-ash-section="welcome"]')!;
    const questionsEl = root.querySelector<HTMLElement>('[data-ash-section="questions"]')!;
    expect(welcomeEl).toBeInTheDocument();
    expect(questionsEl).toBeInTheDocument();
    expect(root.querySelector('[data-ash-section="input"]')).toBeInTheDocument();
    const textarea = root.querySelector<HTMLTextAreaElement>('[data-vt-name="wt-askhoai-input"]')!;
    fireEvent.change(textarea, { target: { value: MSG } });
    const sendBtn = root.querySelector<HTMLButtonElement>('[data-vt-name="wt-askhoai-send-btn"]')!;
    act(() => {
      sendBtn.click();
    });
    return { ...utils, welcomeEl, questionsEl };
  }

  it("fades welcome + questions out before committing the message", () => {
    const { container, welcomeEl, questionsEl } = renderAndSend();
    // Phase 1 is in flight: message not yet committed, welcome still mounted.
    expect(gsap.getTweensOf([welcomeEl, questionsEl]).length).toBeGreaterThan(0);
    expect(welcomeEl.isConnected).toBe(true);
    expect(container.querySelector('[data-ash-section="thread"]')).toBeNull();
  });

  it("kills in-flight welcome->thread tweens on unmount", () => {
    const { unmount, welcomeEl, questionsEl } = renderAndSend();
    expect(gsap.getTweensOf([welcomeEl, questionsEl]).length).toBeGreaterThan(0);
    unmount();
    expect(gsap.getTweensOf(welcomeEl).length).toBe(0);
    expect(gsap.getTweensOf(questionsEl).length).toBe(0);
  });

  it("completes the morph: commits the message, swaps views, leaves no inline residue", () => {
    const { container, welcomeEl, questionsEl, getByText } = renderAndSend();
    act(() => {
      gsap.getTweensOf([welcomeEl, questionsEl]).forEach((t) => t.progress(1));
    });
    expect(getByText(MSG)).toBeInTheDocument();
    expect(container.querySelector('[data-ash-section="welcome"]')).toBeNull();
    expect(container.querySelector('[data-ash-section="questions"]')).toBeNull();

    const threadEl = container.querySelector<HTMLElement>('[data-ash-section="thread"]')!;
    const inputEl = container.querySelector<HTMLElement>('[data-ash-section="input"]')!;
    expect(threadEl).toBeInTheDocument();
    expect(inputEl).toBeInTheDocument();
    expect(inputEl).not.toBe(welcomeEl);
    const phase3 = gsap.getTweensOf([threadEl, inputEl]);
    expect(phase3.length).toBe(2);

    act(() => {
      phase3.forEach((t) => t.progress(1));
    });
    expect(inputEl.style.transform).toBe("");
    expect(threadEl.style.opacity).toBe("");
    expect(gsap.getTweensOf([threadEl, inputEl]).length).toBe(0);
  });

  it("ignores a second send mid-morph: one user bubble, one complete agent reply", () => {
    const { container, welcomeEl, questionsEl } = renderAndSend();
    // Input is not cleared until commit, so Send is still clickable.
    act(() => {
      container.querySelector<HTMLButtonElement>('[data-vt-name="wt-askhoai-send-btn"]')!.click();
    });
    // The in-flight morph is untouched by the ignored click.
    const phase1 = gsap.getTweensOf([welcomeEl, questionsEl]);
    expect(phase1.length).toBeGreaterThan(0);
    act(() => {
      phase1.forEach((t) => t.progress(1));
    });
    const thread = container.querySelector<HTMLElement>('[data-ash-section="thread"]')!;
    act(() => {
      gsap.getTweensOf([thread, container.querySelector('[data-ash-section="input"]')]).forEach((t) =>
        t.progress(1),
      );
    });
    // Typing dots at 500ms, reply starts at 1900ms, ~400 chars at 3 chars / 25ms.
    // Stop before the scripted follow-up (reply end + 1400ms) is sent.
    act(() => {
      vi.advanceTimersByTime(1900 + 4000);
    });
    const userBubbles = Array.from(thread.children).filter((c) => c.textContent === MSG);
    expect(userBubbles).toHaveLength(1);
    const agentBubbles = thread.querySelectorAll(".whitespace-pre-wrap");
    expect(agentBubbles).toHaveLength(1);
    expect(agentBubbles[0].textContent).toMatch(/^Absolutely/);
    expect(agentBubbles[0].textContent).toMatch(/what I already know\?$/);
    expect(thread.children).toHaveLength(2);
  });

  it("leaving the scene mid-morph kills the morph without committing", () => {
    const { rerender, container, welcomeEl, questionsEl } = renderAndSend();
    act(() => {
      gsap.getTweensOf([welcomeEl, questionsEl]).forEach((t) => t.progress(0.5));
    });
    expect(welcomeEl.style.opacity).not.toBe("");
    rerender(<AskHoaiPanel open={true} onCollapse={() => {}} focused={false} />);
    expect(gsap.getTweensOf([welcomeEl, questionsEl]).length).toBe(0);
    expect(container.querySelector('[data-ash-section="thread"]')).toBeNull();
    expect(container.querySelector('[data-ash-section="welcome"]')).toBe(welcomeEl);
    // No half-faded residue when the scene is re-entered.
    expect(welcomeEl.style.opacity).toBe("");
    expect(welcomeEl.style.transform).toBe("");
    expect(questionsEl.style.opacity).toBe("");
  });

  it("commits directly (no morph) when there is no welcome view", () => {
    const { container, welcomeEl, questionsEl, getByText } = renderAndSend();
    act(() => {
      gsap.getTweensOf([welcomeEl, questionsEl]).forEach((t) => t.progress(1));
    });
    const textarea = container.querySelector<HTMLTextAreaElement>('[data-vt-name="wt-askhoai-input"]')!;
    fireEvent.change(textarea, { target: { value: "Second" } });
    act(() => {
      container.querySelector<HTMLButtonElement>('[data-vt-name="wt-askhoai-send-btn"]')!.click();
    });
    expect(getByText("Second")).toBeInTheDocument();
    expect(getByText(MSG)).toBeInTheDocument();
  });

  function completeMorph(container: HTMLElement, welcomeEl: HTMLElement, questionsEl: HTMLElement) {
    act(() => {
      gsap.getTweensOf([welcomeEl, questionsEl]).forEach((t) => t.progress(1));
    });
    const thread = container.querySelector('[data-ash-section="thread"]');
    const input = container.querySelector('[data-ash-section="input"]');
    act(() => {
      gsap.getTweensOf([thread, input]).forEach((t) => t.progress(1));
    });
  }

  function rerenderFocused(rerender: (ui: ReactNode) => void, focused: boolean) {
    rerender(<AskHoaiPanel open={true} onCollapse={() => {}} focused={focused} />);
  }

  it("leaving mid-script stops every scripted timer; re-entering shows a clean welcome view", () => {
    const { rerender, container, welcomeEl, questionsEl, queryByText } = renderAndSend();
    completeMorph(container, welcomeEl, questionsEl);
    act(() => {
      vi.advanceTimersByTime(6000);
    });
    rerenderFocused(rerender, false);
    act(() => {
      vi.advanceTimersByTime(10000);
    });
    expect(vi.getTimerCount()).toBe(0);
    rerenderFocused(rerender, true);

    expect(container.querySelector('[data-ash-section="welcome"]')).toBeInTheDocument();
    expect(container.querySelector('[data-ash-section="thread"]')).toBeNull();
    expect(queryByText("Yes, that would be amazing!")).toBeNull();
    expect(queryByText("Ok, I'll get started. Just a moment.")).toBeNull();
    const textarea = container.querySelector<HTMLTextAreaElement>('[data-vt-name="wt-askhoai-input"]')!;
    expect(textarea.value).toBe("");
    // No stray welcome morph was started inside the hidden panel.
    const welcome = container.querySelector('[data-ash-section="welcome"]')!;
    expect(gsap.getTweensOf(welcome).length).toBe(0);
  });

  it("clears every scripted timer on unmount", () => {
    const { unmount, container, welcomeEl, questionsEl } = renderAndSend();
    completeMorph(container, welcomeEl, questionsEl);
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("defers the visual reset until the 700ms panel morph has finished", () => {
    const { rerender, container, welcomeEl, questionsEl, getByText } = renderAndSend();
    completeMorph(container, welcomeEl, questionsEl);
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    rerenderFocused(rerender, false);
    // Script stops immediately...
    const threadText = container.querySelector('[data-ash-section="thread"]')!.textContent;
    act(() => {
      vi.advanceTimersByTime(699);
    });
    // ...but the thread stays on screen while the panel morphs back.
    expect(container.querySelector('[data-ash-section="thread"]')!.textContent).toBe(threadText);
    expect(getByText(MSG)).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(container.querySelector('[data-ash-section="thread"]')).toBeNull();
    expect(container.querySelector('[data-ash-section="welcome"]')).toBeInTheDocument();
  });

  it("re-entering before the deferred reset fires resets right away", () => {
    const { rerender, container, welcomeEl, questionsEl } = renderAndSend();
    completeMorph(container, welcomeEl, questionsEl);
    rerenderFocused(rerender, false);
    act(() => {
      vi.advanceTimersByTime(300);
    });
    rerenderFocused(rerender, true);
    expect(container.querySelector('[data-ash-section="welcome"]')).toBeInTheDocument();
    expect(container.querySelector('[data-ash-section="thread"]')).toBeNull();
    expect(vi.getTimerCount()).toBe(0);
  });
});
