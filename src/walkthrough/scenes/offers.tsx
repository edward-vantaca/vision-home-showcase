import type { Scene } from "../types";
import { VT } from "../viewTransitionNames";
import { PAGE_LOAD_MS } from "../../pageLoad";

// Picks up on whatever page the portal is showing (keepPage: the feed after the
// community-feed scene, the dashboard from a launcher jump): the cursor clicks
// Offers in the sidebar and the offers page loads. The next → clicks Home and
// the dashboard loads again. Each click holds → until its page is in. ← from
// the next scene re-enters at the top and → replays the Offers click.
export const offersScene: Scene = {
  id: "offers",
  label: "Offers",
  page: "dashboard",
  appState: { phase: "portal", page: "dashboard", dashboardView: "homeowner", askHoaiOpen: true, balancePaid: true },
  keepPage: true,
  reenterAtStart: true,
  beats: [
    { kind: "cursor", to: VT.SidebarNavOffers, action: "click", durationMs: 1200, holdMs: PAGE_LOAD_MS + 500 },
    { kind: "cursor", to: VT.SidebarNavHome, action: "click", durationMs: 1200, holdMs: PAGE_LOAD_MS + 500 },
  ],
};
