import type { Scene } from "../types";
import { VT } from "../viewTransitionNames";
import { PAGE_LOAD_MS } from "../../pageLoad";
import { BOARD_VIEW_SIGNAL, ELECTIONS_RESULTS_SIGNAL } from "../signal";

// Starts on the dashboard (where the phone scene swipes back to). The cursor
// clicks Elections in the sidebar, the page loads, then it eases down past the
// open ballot and the current and upcoming elections, rests at the bottom, and
// slowly scrolls back up to the top, where the page switches to Results. The
// next → clicks Home and the dashboard loads again, in the board member view. The homeowner has already
// consented, so the electronic-consent modal stays shut, and the floating tab
// pill is hidden for the whole scene. The scroll happens on the elections page, not the
// dashboard this scene starts on, so ← from the next scene re-enters at the top.
export const electionsScene: Scene = {
  id: "elections",
  label: "Elections",
  page: "dashboard",
  appState: { phase: "portal", page: "dashboard", dashboardView: "homeowner", askHoaiOpen: false, balancePaid: true, electionsConsented: true, hideElectionsTabToggle: true },
  reenterAtStart: true,
  beats: [
    {
      kind: "cursor",
      to: VT.SidebarNavElections,
      action: "click",
      durationMs: 1200,
      // The page loads first; the scroll starts once it has been up a moment.
      holdMs: PAGE_LOAD_MS + 1000,
      then: [
        { to: VT.ElectionsPage, action: "scroll", scrollMs: 8000, holdMs: 1500 },
        { to: VT.ElectionsPage, action: "scroll", scrollToTop: true, scrollMs: 5000, holdMs: 600 },
        { to: VT.ElectionsPage, action: "signal", signal: ELECTIONS_RESULTS_SIGNAL },
      ],
    },
    {
      kind: "cursor",
      to: VT.SidebarNavHome,
      action: "click",
      durationMs: 1200,
      // While the dashboard loads, switch to the board member view: Board
      // Actions joins the sidebar and the board tasks widget shows under the
      // notification banner.
      then: [{ to: VT.SidebarNavHome, action: "signal", signal: BOARD_VIEW_SIGNAL, holdMs: PAGE_LOAD_MS + 500 }],
    },
  ],
};
