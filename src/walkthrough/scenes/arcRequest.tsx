import type { Scene } from "../types";
import { VT } from "../viewTransitionNames";
import { PAGE_LOAD_MS } from "../../pageLoad";

export const arcRequestScene: Scene = {
  id: "arc-request",
  label: "ARC request",
  page: "dashboard",
  appState: { phase: "portal", page: "dashboard", dashboardView: "homeowner", askHoaiOpen: true, balancePaid: true },
  beats: [
    {
      // Quick Actions -> ARC Request -> Fence Installation lands on the form,
      // which then scrolls slowly to its bottom and rests there. One beat, so
      // stepping back from Ask HOAi resets to the dashboard and replays it.
      kind: "cursor",
      to: VT.QuickActionsBtn,
      action: "click",
      holdMs: 1200,
      durationMs: 1500,
      then: [
        { to: VT.QuickActionsArcRequestBtn, action: "click", holdMs: 1200 },
        // The form loads first; the scroll starts once it has been up a moment.
        { to: VT.ArcFenceFormLink, action: "click", holdMs: PAGE_LOAD_MS + 1300 },
        { to: VT.ArcFormPage, action: "scroll", scrollMs: 6000 },
      ],
    },
  ],
};
