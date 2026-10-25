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

  it("beat 1 opens the thread with the broadcast", () => {
    expect(settledPhoneState(1)).toEqual({
      notification: false,
      view: "thread",
      messages: [{ from: "them", text: SMS_BROADCAST }],
      draft: "",
    });
  });

  it("beat 2 has the reply typed in the draft", () => {
    expect(settledPhoneState(2)).toMatchObject({
      view: "thread",
      messages: [{ from: "them", text: SMS_BROADCAST }],
      draft: SMS_REPLY,
    });
  });

  it("beat 3 has the reply sent and answered", () => {
    const s = settledPhoneState(3);
    expect(s.messages).toEqual([
      { from: "them", text: SMS_BROADCAST },
      { from: "me", text: SMS_REPLY },
      { from: "them", text: SMS_ANSWER },
    ]);
    expect(s.draft).toBe("");
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

  it("forward onto a cursor beat shows the state before it", () => {
    expect(
      phoneStateOnLanding(1, { isCursorBeat: true, direction: "forward", replayOnAdvance: false }),
    ).toEqual(settledPhoneState(0));
    expect(
      phoneStateOnLanding(2, { isCursorBeat: true, direction: "forward", replayOnAdvance: false }),
    ).toEqual(settledPhoneState(1));
  });

  it("back within the scene shows the beat's result", () => {
    expect(
      phoneStateOnLanding(2, { isCursorBeat: true, direction: "back", replayOnAdvance: false }),
    ).toEqual(settledPhoneState(2));
  });

  it("back across the boundary shows the pre-send state", () => {
    expect(
      phoneStateOnLanding(3, { isCursorBeat: true, direction: "back", replayOnAdvance: true }),
    ).toEqual(settledPhoneState(2));
  });
});

describe("SMS copy", () => {
  it("carries no HOAi branding", () => {
    for (const text of [SMS_SENDER, SMS_BROADCAST, SMS_REPLY, SMS_ANSWER]) {
      expect(text).not.toMatch(/hoai|\bai\b/i);
    }
  });
});
