import { describe, expect, it } from "vitest";
import { fireEvent, render } from "@testing-library/react";
import BoardTasksWidget from "../BoardTasksWidget";

// Ask HOAi's sidebar form is fixed at z 190 (see docs/walkthrough.md → Z-index layers).
const ASK_HOAI_SIDEBAR_Z = 190;

function zOf(el: Element | null): number {
  const m = el?.className.toString().match(/(?:^|\s)z-(?:\[(\d+)\]|(\d+))(?:\s|$)/);
  return m ? Number(m[1] ?? m[2]) : 0;
}

describe("Board task detail sheet", () => {
  it("opens above the Ask HOAi panel, backdrop included", () => {
    const { getAllByText } = render(<BoardTasksWidget />);
    fireEvent.click(getAllByText("View Details")[0]);
    const sheet = document.querySelector('[data-ux-id="board-task-detail-sheet"]');
    const backdrop = document.querySelector('[data-ux-id="board-task-detail-backdrop"]');
    expect(sheet).not.toBeNull();
    expect(zOf(backdrop)).toBeGreaterThan(ASK_HOAI_SIDEBAR_Z);
    expect(zOf(sheet)).toBeGreaterThan(zOf(backdrop));
  });
});
