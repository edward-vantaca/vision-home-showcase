import type { Scene } from "../types";
import { VT } from "../viewTransitionNames";

export const onboardingScene: Scene = {
  id: "onboarding",
  label: "Create account",
  page: "onboarding",
  appState: { phase: "onboarding", onboardingScreen: "account" },
  beats: [
    {
      kind: "cursor",
      to: VT.OnboardingPasswordInput,
      action: "click",
      typeText: "WaterfrontSummer25!",
      then: [{ to: VT.OnboardingCreateAccountBtn, action: "click" }],
      reverseTo: VT.OnboardingBackToAccount,
      caption: "Set a password and create the resident portal account.",
    },
  ],
};
