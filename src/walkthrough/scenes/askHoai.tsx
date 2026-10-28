import type { Scene } from "../types";
import { VT } from "../viewTransitionNames";

export const askHoaiScene: Scene = {
  id: "ask-hoai",
  label: "Ask HOAi",
  page: "dashboard",
  appState: { phase: "portal", page: "dashboard", dashboardView: "homeowner", askHoaiOpen: true, balancePaid: true },
  // ← from the next scene (panel collapsed) comes back to the drop and replays the chat.
  reenterAtStart: true,
  beats: [
    {
      // Once the panel has morphed into view, the cursor drags the fence
      // proposal in from off-screen and drops it on the input, then types.
      kind: "cursor",
      to: VT.AskHoaiDropZone,
      action: "drop",
      file: "Fence Proposal.pdf",
      holdMs: 600,
      then: [
        {
          to: VT.AskHoaiInput,
          action: "click",
          typeText: "I have this fence proposal. Can you help me submit it as an ARC request?",
          typeCps: 32,
        },
        { to: VT.AskHoaiSendBtn, action: "click" },
      ],
      caption: "Ask HOAi — your community concierge, always one message away.",
      replayOnBack: true,
    },
    {
      // Close out: collapse the panel. It stays collapsed for the rest of the
      // demo (later scenes open with askHoaiOpen: false). ← reopens it, focused
      // and reset, and → replays the drop and chat.
      kind: "cursor",
      to: VT.AskHoaiCollapseBtn,
      action: "click",
      durationMs: 1200,
      reverseTo: VT.SidebarAskHoaiOpen,
    },
  ],
};
