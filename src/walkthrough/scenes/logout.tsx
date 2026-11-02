import type { Scene } from "../types";
import { VT } from "../viewTransitionNames";
import { PAGE_LOAD_MS } from "../../pageLoad";

// The last interaction: the homeowner logs out. The sidebar scrolls down to
// Log Out, the pointer clicks it, and the portal redirects to the
// association's public home page (Presidential Valley), which loads first.
// The click holds → until the page is in.
export const logoutScene: Scene = {
  id: "logout",
  label: "Log out",
  page: "dashboard",
  appState: { phase: "portal", page: "dashboard", dashboardView: "board", askHoaiOpen: false, balancePaid: true, arcSubmitted: true },
  beats: [
    {
      kind: "cursor",
      to: VT.SidebarScroll,
      action: "scroll",
      scrollMs: 1500,
      holdMs: 300,
      then: [{ to: VT.SidebarNavLogout, action: "click", holdMs: PAGE_LOAD_MS + 500 }],
    },
  ],
};
