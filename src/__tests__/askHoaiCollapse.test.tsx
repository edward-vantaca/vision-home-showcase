import { afterEach, describe, expect, it } from "vitest";
import { act, cleanup, render } from "@testing-library/react";
import App from "../App";
import { WalkthroughProvider } from "../walkthrough/cursor";
import { VT } from "../walkthrough/viewTransitionNames";
import type { Sequence } from "../walkthrough/types";

const seq: Sequence = [
  {
    id: "dashboard",
    page: "dashboard",
    appState: { phase: "portal", page: "dashboard", dashboardView: "homeowner", askHoaiOpen: true },
    beats: [{ kind: "idle" }],
  },
];

afterEach(cleanup);

describe("Ask HOAi collapse button", () => {
  it("is a walkthrough target that collapses the sidebar panel", () => {
    const { container } = render(
      <WalkthroughProvider sequence={seq}>
        <App />
      </WalkthroughProvider>,
    );
    const panel = container.querySelector<HTMLElement>('[data-ux-id="askhoai-panel"]')!;
    expect(panel.className).toContain("w-[400px]");

    const collapse = container.querySelector<HTMLElement>(`[data-vt-name="${VT.AskHoaiCollapseBtn}"]`);
    expect(collapse).not.toBeNull();
    act(() => collapse!.click());

    expect(panel.className).toContain("left-full");
    expect(container.querySelector('[data-ux-id="sidebar-askhoai-open"]')).not.toBeNull();
  });
});
