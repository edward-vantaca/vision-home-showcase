export const SMS_SENDER = "Waterfront Community Estates";
export const SMS_BROADCAST =
  "⚠️ Severe storms are moving through the area this evening. Local flooding is possible. Please avoid low-lying roads and stay indoors. — Waterfront Community Estates Management";
export const SMS_REPLY = "Are any of the amenities still open?";
export const SMS_ANSWER =
  "No, the gym, pool, and clubhouse are all closed until further notice. We'll text you as soon as they reopen.";

export type PhoneMessage = { from: "them" | "me"; text: string };

export type PhoneState = {
  notification: boolean;
  view: "lock" | "thread";
  draft: string;
  messages: PhoneMessage[];
};

/** State after beat `n` (0 lock with notification, 1 thread open, 2 reply typed, 3 answered). */
export function settledPhoneState(beatIndex: number): PhoneState {
  const broadcast: PhoneMessage = { from: "them", text: SMS_BROADCAST };
  if (beatIndex <= 0) return { notification: true, view: "lock", draft: "", messages: [] };
  if (beatIndex === 1) {
    return { notification: false, view: "thread", draft: "", messages: [broadcast] };
  }
  if (beatIndex === 2) {
    return { notification: false, view: "thread", draft: SMS_REPLY, messages: [broadcast] };
  }
  return {
    notification: false,
    view: "thread",
    draft: "",
    messages: [
      broadcast,
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
