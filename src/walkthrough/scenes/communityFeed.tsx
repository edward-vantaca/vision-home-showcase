import type { Scene } from "../types";
import { VT } from "../viewTransitionNames";
import { COMMUNITY_FEED_LOAD_MS } from "../../communityFeedLoad";

// View All Posts on the dashboard opens the community feed, which scrolls
// slowly until the Forgotten Island post sits mid-screen. The post lifts off
// the page, and the next → sets it back down in the feed. The lift happens on
// the feed page, not the dashboard this scene starts on, so ← from the next
// scene re-enters at the top and → replays the click and scroll.
export const communityFeedScene: Scene = {
  id: "community-feed",
  label: "Community feed",
  page: "dashboard",
  appState: { phase: "portal", page: "dashboard", dashboardView: "homeowner", askHoaiOpen: true },
  reenterAtStart: true,
  beats: [
    {
      kind: "cursor",
      to: VT.DashboardFeedViewAll,
      action: "click",
      // The feed loads first; the scroll starts once it has been up a moment.
      holdMs: COMMUNITY_FEED_LOAD_MS + 1000,
      durationMs: 1500,
      then: [{ to: VT.CommunityFeedPage, action: "scroll", scrollTo: VT.FeedPostForgottenIsland, scrollMs: 4000 }],
    },
    { kind: "lift", target: VT.FeedPostForgottenIsland, scale: 1.15, position: "center" },
    { kind: "idle" },
  ],
};
