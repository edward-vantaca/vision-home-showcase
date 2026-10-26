import type { Scene } from "../types";
import { VT } from "../viewTransitionNames";

// The resident dashboard right after entering the portal: the page scrolls
// slowly to the bottom, rests there, then scrolls back up to the top. The
// beat opens on the scroll, so the pointer stays where it was. Same
// appState as Payments, and it ends at the top, so the Payments lift is the
// only thing that changes when the presenter advances.
export const dashboardScene: Scene = {
  id: "dashboard",
  label: "Dashboard",
  page: "dashboard",
  appState: { phase: "portal", page: "dashboard", dashboardView: "homeowner", askHoaiOpen: true },
  beats: [
    {
      kind: "cursor",
      to: VT.DashboardPage,
      action: "scroll",
      scrollMs: 5000,
      holdMs: 3000,
      then: [{ to: VT.DashboardPage, action: "scroll", scrollToTop: true, scrollMs: 3500 }],
    },
  ],
};
