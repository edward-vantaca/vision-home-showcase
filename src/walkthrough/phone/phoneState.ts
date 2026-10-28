export const SMS_SENDER = "Waterfront Estates";
export const SMS_BROADCAST =
  "🛠️ The Clubhouse will be closed Monday, Oct 26 through Wednesday, Oct 28 for planned maintenance. We appreciate your patience while we make these improvements. — Waterfront Community Estates Management";
/** The lock-screen notification shows only the closure itself. */
export const SMS_PREVIEW = SMS_BROADCAST.slice(0, SMS_BROADCAST.indexOf("maintenance.") + "maintenance.".length);
export const SMS_REPLY = "Are the other amenities still open?";
export const SMS_ANSWER = "Yes! The gym, pool, and tennis courts remain open during the clubhouse maintenance.";

export type PhoneMessage = { from: "them" | "me"; text: string };

export type PhoneState = {
  notification: boolean;
  view: "lock" | "thread";
  draft: string;
  messages: PhoneMessage[];
};

/**
 * State after beat `n`: 0 lock screen with the notification; 1 (the tap that
 * opens the thread, types the reply and sends it) answered.
 */
export function settledPhoneState(beatIndex: number): PhoneState {
  if (beatIndex <= 0) return { notification: true, view: "lock", draft: "", messages: [] };
  return {
    notification: false,
    view: "thread",
    draft: "",
    messages: [
      { from: "them", text: SMS_BROADCAST },
      { from: "me", text: SMS_REPLY },
      { from: "them", text: SMS_ANSWER },
    ],
  };
}

/**
 * What to show when the cursor lands on `beatIndex`. Arriving forward on
 * beat 0 shows the lock screen without the notification, which then drops
 * in by itself. A cursor beat that is about to run (forward arrival, or back
 * with replayOnAdvance) shows the state *before* it so its clicks have
 * something to do; otherwise the state after it.
 */
export function phoneStateOnLanding(
  beatIndex: number,
  opts: { isCursorBeat: boolean; direction: "forward" | "back"; replayOnAdvance: boolean },
): PhoneState {
  if (beatIndex <= 0 && opts.direction === "forward") {
    return { ...settledPhoneState(0), notification: false };
  }
  const aboutToRun =
    opts.isCursorBeat && (opts.direction === "forward" || opts.replayOnAdvance);
  return settledPhoneState(aboutToRun ? beatIndex - 1 : beatIndex);
}
