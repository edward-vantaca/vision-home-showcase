import type { Scene } from "../types";
import { VT } from "../viewTransitionNames";
import { SMS_SCENE_ID } from "../phone/PhoneStage";
import { SMS_REPLY } from "../phone/phoneState";

// The app swipes out to a phone on white. A clubhouse-closure broadcast
// arrives, the homeowner opens it and asks about the other amenities, and the answer
// comes back by text. Leaving it swipes the app back in, already showing
// whichever scene comes next. A phone scene has no appState: the app
// underneath follows the app scene (see WalkthroughState.appSceneIndex).
export const broadcastSmsScene: Scene = {
  id: SMS_SCENE_ID,
  label: "Broadcast SMS",
  page: "dashboard",
  stage: "phone",
  beats: [
    { kind: "idle" }, // swipe in; the notification drops in by itself
    {
      // One beat: tap the notification, then reply in the thread it opens.
      kind: "cursor",
      to: VT.SmsNotification,
      action: "click",
      then: [
        { to: VT.SmsInput, action: "click", typeText: SMS_REPLY, typeCps: 24 },
        { to: VT.SmsSendBtn, action: "click" },
      ],
    },
  ],
};
