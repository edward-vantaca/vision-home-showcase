import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render } from "@testing-library/react";
import App from "../App";
import { WalkthroughProvider } from "../walkthrough/cursor";
import { VT } from "../walkthrough/viewTransitionNames";
import type { Sequence } from "../walkthrough/types";

const seq: Sequence = [
  {
    id: "portal",
    page: "dashboard",
    appState: { phase: "portal", page: "dashboard", dashboardView: "board", askHoaiOpen: true },
    beats: [{ kind: "idle" }],
  },
];

const vt = (c: HTMLElement, name: string) => c.querySelector<HTMLElement>(`[data-vt-name="${name}"]`);

describe("Sidebar Board Actions nav", () => {
  afterEach(cleanup);

  it("tags the sidebar's scroll area, the Board Actions section and the items the cursor hovers", () => {
    const { container } = render(
      <WalkthroughProvider sequence={seq}>
        <App />
      </WalkthroughProvider>,
    );
    expect(vt(container, VT.SidebarScroll)?.className).toContain("overflow-y-auto");
    const section = vt(container, VT.SidebarBoardActions)!;
    expect(section.textContent).toContain("Board Actions");
    for (const [name, label] of [
      [VT.SidebarBoardArcs, "ARCs"],
      [VT.SidebarBoardInvoices, "Invoices"],
      [VT.SidebarBoardWorkOrders, "Work Orders"],
      [VT.SidebarBoardReports, "Reports"],
    ] as const) {
      const item = vt(container, name)!;
      expect(item.textContent).toBe(label);
      expect(section.contains(item)).toBe(true);
    }
  });

  it("shows an item's hover state for the scripted pointer's mouseover, and clears it on mouseout", () => {
    const { container } = render(
      <WalkthroughProvider sequence={seq}>
        <App />
      </WalkthroughProvider>,
    );
    const item = vt(container, VT.SidebarBoardInvoices)!;
    expect(item.getAttribute("data-hovered")).toBeNull();
    fireEvent.mouseOver(item);
    expect(item.getAttribute("data-hovered")).toBe("true");
    expect(item.className).toContain("bg-[#f2f6fa]");
    fireEvent.mouseOut(item);
    expect(item.getAttribute("data-hovered")).toBeNull();
  });
});
