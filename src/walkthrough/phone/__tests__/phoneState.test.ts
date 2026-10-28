import { describe, expect, it } from "vitest";
import {
  SMS_ANSWER,
  SMS_BROADCAST,
  SMS_REPLY,
  SMS_SENDER,
  phoneStateOnLanding,
  settledPhoneState,
} from "../phoneState";

describe("settledPhoneState", () => {
  it("beat 0 is the lock screen with the notification", () => {
    expect(settledPhoneState(0)).toEqual({
      notification: true,
      view: "lock",
      draft: "",
      messages: [],
    });
  });

  it("beat 1 has the thread open with the reply sent and answered", () => {
    expect(settledPhoneState(1)).toEqual({
      notification: false,
      view: "thread",
      draft: "",
      messages: [
        { from: "them", text: SMS_BROADCAST },
        { from: "me", text: SMS_REPLY },
        { from: "them", text: SMS_ANSWER },
      ],
    });
  });
});

describe("phoneStateOnLanding", () => {
  it("forward onto beat 0 starts with no notification so it can drop in", () => {
    expect(
      phoneStateOnLanding(0, { isCursorBeat: false, direction: "forward", replayOnAdvance: false }),
    ).toEqual({ notification: false, view: "lock", draft: "", messages: [] });
  });

  it("back onto beat 0 shows the notification already there", () => {
    expect(
      phoneStateOnLanding(0, { isCursorBeat: false, direction: "back", replayOnAdvance: false }),
    ).toEqual(settledPhoneState(0));
  });

  it("forward onto the cursor beat shows the lock screen it starts from", () => {
    expect(
      phoneStateOnLanding(1, { isCursorBeat: true, direction: "forward", replayOnAdvance: false }),
    ).toEqual(settledPhoneState(0));
  });

  it("back across the boundary shows the lock screen so → replays the beat", () => {
    expect(
      phoneStateOnLanding(1, { isCursorBeat: true, direction: "back", replayOnAdvance: true }),
    ).toEqual(settledPhoneState(0));
  });

  it("back without a replay shows the answered thread", () => {
    expect(
      phoneStateOnLanding(1, { isCursorBeat: true, direction: "back", replayOnAdvance: false }),
    ).toEqual(settledPhoneState(1));
  });
});

describe("SMS copy", () => {
  it("announces a clubhouse closure; the resident asks about the other amenities; gym, pool and tennis stay open", () => {
    expect(SMS_BROADCAST).toMatch(/clubhouse/i);
    expect(SMS_BROADCAST).toMatch(/planned maintenance/i);
    expect(SMS_REPLY).toMatch(/other amenities/i);
    expect(SMS_ANSWER).toMatch(/^Yes/);
    expect(SMS_ANSWER).toMatch(/gym, pool, and tennis courts remain open/);
  });

  it("carries no HOAi branding", () => {
    for (const text of [SMS_SENDER, SMS_BROADCAST, SMS_REPLY, SMS_ANSWER]) {
      expect(text).not.toMatch(/hoai|\bai\b/i);
    }
  });
});
