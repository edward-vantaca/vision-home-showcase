import type { Scene } from "../types";
import { VT } from "../viewTransitionNames";

export const inboxScene: Scene = {
  id: "inbox",
  label: "Inbox email",
  page: "inbox",
  appState: { phase: "inbox" },
  beats: [
    { kind: "idle" },
    {
      kind: "cursor",
      to: VT.InboxHoaEmail,
      action: "click",
      reverseTo: VT.InboxEmailBack,
      caption: "A welcome email from your HOA lands in your inbox.",
    },
    {
      kind: "cursor",
      to: VT.InboxRegisterCta,
      action: "click",
      reverseTo: VT.OnboardingBackToInbox,
      caption: "One tap to activate your resident portal.",
    },
  ],
};
