import type { Scene } from "../types";
import { VT } from "../viewTransitionNames";
import { BOARD_REVIEW_RESET_SIGNAL } from "../signal";

// The board member's dashboard (the elections scene's Home click switched to
// it). The Board Actions widget lifts; the next → brings the pointer in to
// approve the first item, go to the next, approve that, go to the next, and
// open View Details. The detail sheet slides in over the still-lifted widget
// (it stacks above the lift layer), stays up a few seconds, the X closes it,
// and the pointer approves the third item. A second later the scene moves on
// by itself (advanceAfter) to its last beat: the lift ends, and the sidebar
// tour runs (Board Actions scrolled into view, a few items hovered, back up).
// The review beat opens by resetting the widget (signal, pointer stays put),
// so it plays from the first item however the presenter arrived.
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
        { to: VT.BoardTaskViewDetailsBtn, action: "click", holdMs: 4000 },
        { to: VT.BoardTaskDetailCloseBtn, action: "click", holdMs: 600 },
        { to: VT.BoardTaskApproveBtn, action: "click", holdMs: 1000 },
      ],
      advanceAfter: true,
    },
    {
      // The lift is over (the widget settles back) and the cursor waits for
      // it; the sidebar scrolls Board Actions into view, the pointer runs
      // over a few of its items, and the sidebar scrolls back to the top.
      kind: "cursor",
      to: VT.SidebarScroll,
      action: "scroll",
      scrollTo: VT.SidebarBoardActions,
      scrollMs: 1800,
      holdMs: 300,
      durationMs: 1000,
      then: [
        { to: VT.SidebarBoardArcs, action: "hover", holdMs: 700 },
        { to: VT.SidebarBoardInvoices, action: "hover", holdMs: 700 },
        { to: VT.SidebarBoardWorkOrders, action: "hover", holdMs: 700 },
        { to: VT.SidebarBoardReports, action: "hover", holdMs: 3500 },
        { to: VT.SidebarScroll, action: "scroll", scrollToTop: true, scrollMs: 1800 },
      ],
    },
  ],
};
