import type { Scene } from "../types";
import { VT } from "../viewTransitionNames";
import { PAGE_LOAD_MS } from "../../pageLoad";

// Arrives on the dashboard and waits (the Ask HOAi panel settles back into
// the sidebar). The next → clicks View All Posts: the community feed loads,
// scrolls slowly down to the last post, then back up until the Forgotten
// Island post sits mid-screen. The post
// lifts off the page, and the next → sets it back down in the feed. The lift
// happens on the feed page, not the dashboard this scene starts on, so ← from
// the next scene re-enters at the top.
export const communityFeedScene: Scene = {
  id: "community-feed",
  label: "Community feed",
  page: "dashboard",
  appState: { phase: "portal", page: "dashboard", dashboardView: "homeowner", askHoaiOpen: true, balancePaid: true },
  reenterAtStart: true,
  beats: [
    { kind: "idle" },
    {
      kind: "cursor",
      to: VT.DashboardFeedViewAll,
      action: "click",
      // The feed loads first; the scroll starts once it has been up a moment.
      holdMs: PAGE_LOAD_MS + 1000,
      durationMs: 1500,
      then: [
        { to: VT.CommunityFeedPage, action: "scroll", scrollMs: 7000, holdMs: 1000 },
        { to: VT.CommunityFeedPage, action: "scroll", scrollTo: VT.FeedPostForgottenIsland, scrollMs: 4000 },
      ],
    },
    { kind: "lift", target: VT.FeedPostForgottenIsland, scale: 1.15, position: "center" },
    { kind: "idle" },
  ],
};
