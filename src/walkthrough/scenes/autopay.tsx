import type { Scene } from "../types";
import { VT } from "../viewTransitionNames";

export const autopayScene: Scene = {
  id: "autopay",
  label: "AutoPay enrollment",
  page: "onboarding",
  appState: { phase: "onboarding", onboardingScreen: "autopay" },
  beats: [
    {
      kind: "cursor",
      to: VT.AutoPayCardName,
      action: "click",
      typeText: "Alex Johnson",
      typeCps: 30,
      then: [
        { to: VT.AutoPayCardNumber, action: "tab", typeText: "4242 4242 4242 4242", typeCps: 30 },
        { to: VT.AutoPayExpiry, action: "tab", typeText: "12/28", typeCps: 30 },
        { to: VT.AutoPayCvv, action: "tab", typeText: "123", typeCps: 30 },
        { to: VT.AutoPayEnrollBtn, action: "click" },
      ],
      reverseTo: VT.OnboardingBackToConfirm,
      caption: "Fill in payment details and enroll in AutoPay.",
    },
  ],
};
