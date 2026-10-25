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
  it("beat 0 is an empty lock screen", () => {
    expect(settledPhoneState(0)).toEqual({
      notification: false,
      view: "lock",
      draft: "",
      messages: [],
    });
  });

  it("beat 1 shows the notification on the lock screen", () => {
    const s = settledPhoneState(1);
    expect(s.notification).toBe(true);
    expect(s.view).toBe("lock");
  });

  it("beat 2 opens the thread with the broadcast", () => {
    expect(settledPhoneState(2)).toMatchObject({
      view: "thread",
      messages: [{ from: "them", text: SMS_BROADCAST }],
      draft: "",
    });
  });

  it("beat 3 has the reply typed in the draft", () => {
    expect(settledPhoneState(3).draft).toBe(SMS_REPLY);
  });

  it("beat 4 has the reply sent and answered", () => {
    const s = settledPhoneState(4);
    expect(s.messages).toEqual([
      { from: "them", text: SMS_BROADCAST },
      { from: "me", text: SMS_REPLY },
      { from: "them", text: SMS_ANSWER },
    ]);
    expect(s.draft).toBe("");
  });
});

describe("phoneStateOnLanding", () => {
  it("forward onto a cursor beat shows the state before it", () => {
    expect(
      phoneStateOnLanding(3, { isCursorBeat: true, direction: "forward", replayOnAdvance: false }),
    ).toEqual(settledPhoneState(2));
  });

  it("back within the scene shows the beat's result", () => {
    expect(
      phoneStateOnLanding(3, { isCursorBeat: true, direction: "back", replayOnAdvance: false }),
    ).toEqual(settledPhoneState(3));
  });

  it("back across the boundary shows the pre-send state", () => {
    expect(
      phoneStateOnLanding(4, { isCursorBeat: true, direction: "back", replayOnAdvance: true }),
    ).toEqual(settledPhoneState(3));
  });

  it("non-cursor beats always show their own state", () => {
    expect(
      phoneStateOnLanding(1, { isCursorBeat: false, direction: "forward", replayOnAdvance: false }),
    ).toEqual(settledPhoneState(1));
  });
});

describe("SMS copy", () => {
  it("carries no HOAi branding", () => {
    for (const text of [SMS_SENDER, SMS_BROADCAST, SMS_REPLY, SMS_ANSWER]) {
      expect(text).not.toMatch(/hoai|\bai\b/i);
    }
  });
});
