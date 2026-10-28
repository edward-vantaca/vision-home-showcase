import { afterEach, describe, expect, it } from "vitest";
import { act, cleanup, render } from "@testing-library/react";
import App from "../App";
import { WalkthroughProvider } from "../walkthrough/cursor";
import { VT } from "../walkthrough/viewTransitionNames";
import type { Sequence } from "../walkthrough/types";

const seq: Sequence = [
  {
    id: "ask-hoai",
    page: "dashboard",
    appState: { phase: "portal", page: "dashboard", dashboardView: "homeowner", askHoaiOpen: true },
    beats: [{ kind: "idle" }],
  },
];

afterEach(cleanup);

describe("Ask HOAi collapse during the ask-hoai scene", () => {
  it("the collapse button unfocuses and collapses the panel, and the sidebar offers to reopen it", () => {
    const { container } = render(
      <WalkthroughProvider sequence={seq}>
        <App />
      </WalkthroughProvider>,
    );
    const panel = container.querySelector<HTMLElement>('[data-ux-id="askhoai-panel"]')!;
    expect(panel.className).toContain("left-1/2");

    const collapse = container.querySelector<HTMLElement>(`[data-vt-name="${VT.AskHoaiCollapseBtn}"]`);
    expect(collapse).not.toBeNull();
    act(() => collapse!.click());

    expect(panel.className).toContain("left-full");
    const reopen = container.querySelector<HTMLElement>(`[data-vt-name="${VT.SidebarAskHoaiOpen}"]`);
    expect(reopen).not.toBeNull();

    // reverseTo: reopening it puts the panel back in focus for a replay.
    act(() => reopen!.click());
    expect(panel.className).toContain("left-1/2");
  });
});
