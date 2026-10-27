import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render } from "@testing-library/react";
import App from "../App";
import { PAGE_LOAD_MS } from "../pageLoad";
import { WalkthroughProvider } from "../walkthrough/cursor";
import type { SceneAppState, Sequence } from "../walkthrough/types";

const q = (c: HTMLElement, uxId: string) => c.querySelector<HTMLElement>(`[data-ux-id="${uxId}"]`);

function openElections(appState: SceneAppState) {
  const seq: Sequence = [{ id: "portal", page: "dashboard", appState, beats: [{ kind: "idle" }] }];
  const { container } = render(
    <WalkthroughProvider sequence={seq}>
      <App />
    </WalkthroughProvider>,
  );
  fireEvent.click(q(container, "sidebar-nav-elections")!);
  act(() => {
    vi.advanceTimersByTime(PAGE_LOAD_MS);
  });
  return container;
}

describe("Elections consent modal", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("asks for electronic consent on the first visit", () => {
    const c = openElections({ phase: "portal", page: "dashboard", dashboardView: "homeowner", askHoaiOpen: true });
    expect(q(c, "elections-consent-modal")).not.toBeNull();
  });

  it("is skipped when the scene says the homeowner has already consented", () => {
    const c = openElections({ phase: "portal", page: "dashboard", dashboardView: "homeowner", askHoaiOpen: true, electionsConsented: true });
    expect(q(c, "elections-page")).not.toBeNull();
    expect(q(c, "elections-ballot-card")).not.toBeNull();
    expect(q(c, "elections-consent-modal")).toBeNull();
  });
});
