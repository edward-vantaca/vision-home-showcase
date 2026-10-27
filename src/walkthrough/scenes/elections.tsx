import type { Scene } from "../types";
import { VT } from "../viewTransitionNames";
import { PAGE_LOAD_MS } from "../../pageLoad";

// Starts on the dashboard (where the phone scene swipes back to). One beat: the
// cursor clicks Elections in the sidebar, the page loads, then it eases down
// past the open ballot and the current and upcoming elections, rests at the
// bottom, then slowly scrolls back up to the top. The next → clicks Home and
// the dashboard loads again. The homeowner has already consented, so the electronic-consent modal stays shut.
// The scroll happens on the elections page, not the dashboard this scene
// starts on, so ← from the next scene re-enters at the top.
export const electionsScene: Scene = {
  id: "elections",
  label: "Elections",
  page: "dashboard",
  appState: { phase: "portal", page: "dashboard", dashboardView: "homeowner", askHoaiOpen: true, balancePaid: true, electionsConsented: true },
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
        { to: VT.ElectionsPage, action: "scroll", scrollToTop: true, scrollMs: 5000 },
      ],
    },
    { kind: "cursor", to: VT.SidebarNavHome, action: "click", durationMs: 1200, holdMs: PAGE_LOAD_MS + 500 },
  ],
};
