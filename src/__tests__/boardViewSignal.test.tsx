import { describe, expect, it } from "vitest";
import { act, render } from "@testing-library/react";
import App from "../App";
import { WalkthroughProvider } from "../walkthrough/cursor";
import { BOARD_VIEW_SIGNAL, SIGNAL_EVENT } from "../walkthrough/signal";
import type { Sequence } from "../walkthrough/types";

const q = (c: HTMLElement, uxId: string) => c.querySelector<HTMLElement>(`[data-ux-id="${uxId}"]`);

function renderApp(dashboardView: "homeowner" | "board") {
  const seq: Sequence = [
    { id: "portal", page: "dashboard", appState: { phase: "portal", page: "dashboard", dashboardView, askHoaiOpen: true }, beats: [{ kind: "idle" }] },
  ];
  return render(
    <WalkthroughProvider sequence={seq}>
      <App />
    </WalkthroughProvider>,
  ).container;
}

describe("Board member view", () => {
  it("the board-view signal switches the portal to the board member view", () => {
    const c = renderApp("homeowner");
    expect(q(c, "sidebar-board-actions-toggle")).toBeNull();
    expect(q(c, "board-tasks-widget")).toBeNull();
    act(() => {
      q(c, "sidebar-nav-home")!.dispatchEvent(new CustomEvent(SIGNAL_EVENT, { bubbles: true, detail: { name: BOARD_VIEW_SIGNAL } }));
    });
    expect(q(c, "sidebar-board-actions-toggle")).not.toBeNull();
    expect(q(c, "board-tasks-widget")).not.toBeNull();
  });

  it("puts the board tasks widget at the top of the dashboard, above the election banner", () => {
    const c = renderApp("board");
    const widget = q(c, "board-tasks-widget")!;
    const banner = q(c, "election-banner")!;
    expect(widget.compareDocumentPosition(banner) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
