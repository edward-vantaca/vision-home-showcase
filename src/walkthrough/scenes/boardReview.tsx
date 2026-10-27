import type { Scene } from "../types";
import { VT } from "../viewTransitionNames";
import { BOARD_REVIEW_RESET_SIGNAL } from "../signal";

// The board member's dashboard (the elections scene's Home click switched to
// it). The Board Actions widget lifts; the next → brings the pointer in to
// approve the first item, go to the next, approve that, go to the next, and
// open View Details. The detail sheet slides in over the still-lifted widget
// (it stacks above the lift layer), stays up a moment, the X closes it, and
// the pointer approves the third item. A second later the scene moves on by
// itself (advanceAfter): the widget settles back into the dashboard.
// The beat opens by resetting the widget (signal, pointer stays put), so it
// plays from the first item however the presenter arrived.
export const boardReviewScene: Scene = {
  id: "board-review",
  label: "Board review",
  page: "dashboard",
  appState: { phase: "portal", page: "dashboard", dashboardView: "board", askHoaiOpen: true, balancePaid: true },
  beats: [
    { kind: "lift", target: VT.BoardTasksWidget, scale: 1.05, position: "center" },
    {
      kind: "cursor",
      to: VT.BoardTasksWidget,
      action: "signal",
      signal: BOARD_REVIEW_RESET_SIGNAL,
      durationMs: 1300,
      then: [
        { to: VT.BoardTaskApproveBtn, action: "click", holdMs: 1000 },
        { to: VT.BoardTaskNextBtn, action: "click", holdMs: 800 },
        { to: VT.BoardTaskApproveBtn, action: "click", holdMs: 1000 },
        { to: VT.BoardTaskNextBtn, action: "click", holdMs: 800 },
        { to: VT.BoardTaskViewDetailsBtn, action: "click", holdMs: 1500 },
        { to: VT.BoardTaskDetailCloseBtn, action: "click", holdMs: 600 },
        { to: VT.BoardTaskApproveBtn, action: "click", holdMs: 1000 },
      ],
      advanceAfter: true,
    },
  ],
};
