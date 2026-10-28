import type { Scene } from "../types";
import { VT } from "../viewTransitionNames";
import { PAGE_LOAD_MS } from "../../pageLoad";

// Arrives on the dashboard as the Ask HOAi panel settles back into the
// sidebar; the pointer then clicks its collapse button, and every later scene
// keeps it collapsed (askHoaiOpen: false). The next → clicks View All Posts:
// the community feed loads, steps down post by post (resting 2 s on each) to
// the last one, then scrolls back up until the Forgotten Island post sits
// mid-screen. The post lifts off the page, and the next → sets it back down in the feed. The lift
// happens on the feed page, not the dashboard this scene starts on, so ← from
// the next scene re-enters at the top.
export const communityFeedScene: Scene = {
  id: "community-feed",
  label: "Community feed",
  page: "dashboard",
  appState: { phase: "portal", page: "dashboard", dashboardView: "homeowner", askHoaiOpen: true, balancePaid: true },
  reenterAtStart: true,
  beats: [
    // Travel starts once the panel's morph back has settled.
    { kind: "cursor", to: VT.AskHoaiCollapseBtn, action: "click", durationMs: 1400 },
    {
      kind: "cursor",
      to: VT.DashboardFeedViewAll,
      action: "click",
      // The feed loads first; the scroll starts once it has been up a moment.
      holdMs: PAGE_LOAD_MS + 1000,
      durationMs: 1500,
      // Post by post down the feed, resting on each, then back up.
      then: [
        { to: VT.CommunityFeedPage, action: "scroll", scrollTo: VT.FeedPostForgottenIsland, scrollMs: 1600, holdMs: 2000 },
        { to: VT.CommunityFeedPage, action: "scroll", scrollTo: VT.FeedPostTennis, scrollMs: 1600, holdMs: 2000 },
        { to: VT.CommunityFeedPage, action: "scroll", scrollTo: VT.FeedPostGarden, scrollMs: 1600, holdMs: 2000 },
        { to: VT.CommunityFeedPage, action: "scroll", scrollTo: VT.FeedPostPool, scrollMs: 1600, holdMs: 2000 },
        { to: VT.CommunityFeedPage, action: "scroll", scrollTo: VT.FeedPostNeighbors, scrollMs: 1600, holdMs: 2000 },
        { to: VT.CommunityFeedPage, action: "scroll", scrollTo: VT.FeedPostForgottenIsland, scrollMs: 4000 },
      ],
    },
    { kind: "lift", target: VT.FeedPostForgottenIsland, scale: 1.15, position: "center" },
    { kind: "idle" },
  ],
};
