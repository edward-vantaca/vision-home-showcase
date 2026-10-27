import type { Scene } from "../types";
import { VT } from "../viewTransitionNames";
import { BOARD_REVIEW_RESET_SIGNAL } from "../signal";

// The board member's dashboard (the elections scene's Home click switched to
// it). The Board Actions widget lifts; the next → brings the pointer in to
// approve the first item, go to the next, approve that, go to the next, and
// open View Details. The detail sheet sits below the lift layer, so that click
// releases the widget back into the dashboard as the sheet slides in.
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
        { to: VT.BoardTaskViewDetailsBtn, action: "click", releaseStage: true },
      ],
    },
  ],
};
