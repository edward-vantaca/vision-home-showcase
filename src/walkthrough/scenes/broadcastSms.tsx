import type { Scene } from "../types";
import { VT } from "../viewTransitionNames";
import { SMS_SCENE_ID } from "../phone/PhoneStage";
import { SMS_REPLY } from "../phone/phoneState";

// The app swipes out to a phone on white. A community-wide storm broadcast
// arrives, the homeowner opens it and asks about amenities, and the answer
// comes back by text. Leaving it swipes the dashboard back in.
export const broadcastSmsScene: Scene = {
  id: SMS_SCENE_ID,
  label: "Broadcast SMS",
  page: "dashboard",
  appState: { phase: "portal", page: "dashboard", dashboardView: "homeowner", askHoaiOpen: true },
  beats: [
    { kind: "idle" }, // swipe in, empty lock screen
    { kind: "idle" }, // notification arrives
    { kind: "cursor", to: VT.SmsNotification, action: "click" },
    { kind: "cursor", to: VT.SmsInput, action: "click", typeText: SMS_REPLY, typeCps: 24 },
    { kind: "cursor", to: VT.SmsSendBtn, action: "click" },
  ],
};
