import type { Scene } from "../types";
import { VT } from "../viewTransitionNames";

export const askHoaiScene: Scene = {
  id: "ask-hoai",
  label: "Ask HOAi",
  page: "dashboard",
  appState: { phase: "portal", page: "dashboard", dashboardView: "homeowner", askHoaiOpen: true },
  beats: [
    {
      kind: "cursor",
      to: VT.AskHoaiInput,
      action: "click",
      typeText: "I'm looking to replace my fence. Can you help me get started?",
      typeCps: 32,
      then: [{ to: VT.AskHoaiSendBtn, action: "click" }],
      caption: "Ask HOAi — your community concierge, always one message away.",
    },
  ],
};
