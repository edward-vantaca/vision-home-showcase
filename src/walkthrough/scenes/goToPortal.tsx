import type { Scene } from "../types";
import { VT } from "../viewTransitionNames";
import { PAGE_LOAD_MS } from "../../pageLoad";

export const goToPortalScene: Scene = {
  id: "go-to-portal",
  label: "Enter portal",
  page: "onboarding",
  appState: { phase: "onboarding", onboardingScreen: "done" },
  beats: [
    {
      kind: "cursor",
      to: VT.OnboardingGoToPortalBtn,
      action: "click",
      // The dashboard shows its loader first: keep → blocked until it's in,
      // so the next scenes' dashboard targets exist.
      holdMs: PAGE_LOAD_MS + 300,
      reverseTo: VT.PortalBackToDone,
      caption: "Enter the resident portal.",
    },
  ],
};
