import type { Scene } from "../types";
import { VT } from "../viewTransitionNames";

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
      reverseTo: VT.PortalBackToDone,
      caption: "Enter the resident portal.",
    },
  ],
};
