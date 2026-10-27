import { afterEach, describe, expect, it } from "vitest";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import BoardTasksWidget from "../BoardTasksWidget";

// See docs/walkthrough.md → Z-index layers: Ask HOAi's sidebar form is fixed at
// z 190; a lifted element sits at 260 (the board-review scene opens the sheet
// with the widget still lifted).
const ASK_HOAI_SIDEBAR_Z = 190;
const LIFTED_Z = 260;

function zOf(el: Element | null): number {
  const m = el?.className.toString().match(/(?:^|\s)z-(?:\[(\d+)\]|(\d+))(?:\s|$)/);
  return m ? Number(m[1] ?? m[2]) : 0;
}

describe("Board task detail sheet", () => {
  afterEach(cleanup);

  it("opens above the Ask HOAi panel and a lifted element, backdrop included", () => {
    const { getAllByText } = render(<BoardTasksWidget />);
    fireEvent.click(getAllByText("View Details")[0]);
    const sheet = document.querySelector('[data-ux-id="board-task-detail-sheet"]');
    const backdrop = document.querySelector('[data-ux-id="board-task-detail-backdrop"]');
    expect(sheet).not.toBeNull();
    expect(zOf(backdrop)).toBeGreaterThan(ASK_HOAI_SIDEBAR_Z);
    expect(zOf(backdrop)).toBeGreaterThan(LIFTED_Z);
    expect(zOf(sheet)).toBeGreaterThan(zOf(backdrop));
  });

  it("slides in from the right, and slides back out before it unmounts", () => {
    const { getAllByText } = render(<BoardTasksWidget />);
    fireEvent.click(getAllByText("View Details")[0]);
    const sheet = () => document.querySelector<HTMLElement>('[data-ux-id="board-task-detail-sheet"]');
    expect(sheet()!.className).toContain("animate-[board-sheet-in");

    fireEvent.click(document.querySelector('[data-ux-id="board-task-detail-close"]')!);
    // Still mounted while it slides out.
    expect(sheet()!.className).toContain("animate-[board-sheet-out");
    // jsdom has no AnimationEvent, so React listens for the webkit name.
    act(() => {
      fireEvent(sheet()!, new Event("webkitAnimationEnd", { bubbles: true }));
    });
    expect(sheet()).toBeNull();
    expect(document.querySelector('[data-ux-id="board-task-detail-backdrop"]')).toBeNull();
  });
});

