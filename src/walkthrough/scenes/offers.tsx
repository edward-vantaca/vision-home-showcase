import type { Scene } from "../types";
import { VT } from "../viewTransitionNames";
import { PAGE_LOAD_MS } from "../../pageLoad";

// Picks up on the community feed: the cursor clicks Offers in the sidebar and
// the offers page loads. The next → clicks Home and the dashboard loads again.
// Each click holds → until its page is in. The second beat sits on the offers
// page, which the scene's appState doesn't show, so ← from the next scene
// re-enters at the top and → replays the Offers click.
export const offersScene: Scene = {
  id: "offers",
  label: "Offers",
  page: "community",
  appState: { phase: "portal", page: "community", dashboardView: "homeowner", askHoaiOpen: true, balancePaid: true },
  reenterAtStart: true,
  beats: [
    { kind: "cursor", to: VT.SidebarNavOffers, action: "click", durationMs: 1200, holdMs: PAGE_LOAD_MS + 500 },
    { kind: "cursor", to: VT.SidebarNavHome, action: "click", durationMs: 1200, holdMs: PAGE_LOAD_MS + 500 },
  ],
};
