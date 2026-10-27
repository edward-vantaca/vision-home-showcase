import { afterEach, describe, expect, it } from "vitest";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import BoardTasksWidget from "../BoardTasksWidget";
import { VT } from "../../walkthrough/viewTransitionNames";
import { BOARD_REVIEW_RESET_SIGNAL, SIGNAL_EVENT } from "../../walkthrough/signal";

const vt = (name: string) => document.querySelector<HTMLElement>(`[data-vt-name="${name}"]`);

describe("Board tasks widget — walkthrough targets", () => {
  afterEach(cleanup);

  it("tags the widget, Approve, Next Item and View Details for the cursor", () => {
    render(<BoardTasksWidget />);
    expect(vt(VT.BoardTasksWidget)?.getAttribute("data-ux-id")).toBe("board-tasks-widget");
    expect(vt(VT.BoardTaskViewDetailsBtn)?.textContent).toBe("View Details");
    fireEvent.click(vt(VT.BoardTaskViewDetailsBtn)!);
    const close = vt(VT.BoardTaskDetailCloseBtn);
    expect(close).not.toBeNull();
    expect(close!.closest('[data-ux-id="board-task-detail-sheet"]')).not.toBeNull();
    expect(vt(VT.BoardTaskNextBtn)).toBeNull();
    fireEvent.click(vt(VT.BoardTaskApproveBtn)!);
    expect(vt(VT.BoardTaskApproveBtn)).toBeNull();
    expect(vt(VT.BoardTaskNextBtn)?.textContent).toContain("Next Item");
  });

  it("approve, next, approve, next lands on the third item; the reset signal starts over", () => {
    const { getByText } = render(<BoardTasksWidget />);
    for (let i = 0; i < 2; i++) {
      fireEvent.click(vt(VT.BoardTaskApproveBtn)!);
      fireEvent.click(vt(VT.BoardTaskNextBtn)!);
    }
    expect(getByText(/Reviewing 3 of/)).toBeTruthy();
    fireEvent.click(vt(VT.BoardTaskViewDetailsBtn)!);
    expect(document.querySelector('[data-ux-id="board-task-detail-sheet"]')).not.toBeNull();

    act(() => {
      vt(VT.BoardTasksWidget)!.dispatchEvent(new CustomEvent(SIGNAL_EVENT, { bubbles: true, detail: { name: BOARD_REVIEW_RESET_SIGNAL } }));
    });
    expect(getByText(/Reviewing 1 of/)).toBeTruthy();
    expect(vt(VT.BoardTaskApproveBtn)).not.toBeNull();
    expect(document.querySelector('[data-ux-id="board-task-detail-sheet"]')).toBeNull();
  });
});
