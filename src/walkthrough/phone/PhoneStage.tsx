import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { holdBusy, useCursor } from "../cursor";
import { VT } from "../viewTransitionNames";
import PhoneFrame from "./PhoneFrame";
import {
  SMS_ANSWER,
  SMS_BROADCAST,
  SMS_PREVIEW,
  SMS_SENDER,
  phoneStateOnLanding,
  type PhoneState,
} from "./phoneState";

export const SMS_SCENE_ID = "broadcast-sms";

/** How long after landing (and after any swipe in) the notification drops in. */
export const NOTIFICATION_DELAY_MS = 500;
const NOTIFICATION_HOLD_FALLBACK_MS = 700;
const TYPING_DOTS_AT_MS = 500;
export const ANSWER_AT_MS = 1900;
/** Backstop for the hold a scripted tap takes, in case Send never comes. */
export const THREAD_HOLD_FALLBACK_MS = 12000;

/**
 * The broadcast SMS scene's phone. Always renders; the layer around it
 * decides whether it's on screen. Follows the cursor only while the scene is
 * current and keeps its last state otherwise, so it can slide out intact.
 *
 * `swipeInMs`: the length of the swipe bringing the phone in, if one is in
 * flight (0 for a hard cut). Read when the phone lands, so the notification
 * drops in `NOTIFICATION_DELAY_MS` after the swipe has finished.
 */
export default function PhoneStage({ swipeInMs = 0 }: { swipeInMs?: number }) {
  const { sceneId, scene, cursor, direction, replayOnAdvance } = useCursor();
  // Starts as a forward landing on beat 0 would: no notification yet.
  const [phone, setPhone] = useState<PhoneState>(() =>
    phoneStateOnLanding(0, { isCursorBeat: false, direction: "forward", replayOnAdvance: false }),
  );
  const [typing, setTyping] = useState(false);
  const [animateNotification, setAnimateNotification] = useState(false);
  // Messages at or after this index were added by the send script and animate in.
  const [animateFrom, setAnimateFrom] = useState(Infinity);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const releases = useRef<(() => void)[]>([]);
  const releaseNotification = useRef<() => void>(() => {});
  const releaseThread = useRef<() => void>(() => {});
  const inputRef = useRef<HTMLTextAreaElement>(null);
  // Only the value at landing matters; a ref keeps it out of the effect's deps.
  const swipeIn = useRef(swipeInMs);
  swipeIn.current = swipeInMs;

  const stopScript = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    releases.current.forEach((release) => release());
    releases.current = [];
    setTyping(false);
  }, []);

  const hold = useCallback(() => {
    const release = holdBusy();
    releases.current.push(release);
    return release;
  }, []);

  const later = useCallback((ms: number, fn: () => void) => {
    timers.current.push(setTimeout(fn, ms));
  }, []);

  const inScene = sceneId === SMS_SCENE_ID;
  const { beatIndex } = cursor;
  const isCursorBeat = scene?.beats[beatIndex]?.kind === "cursor";

  useEffect(() => {
    if (inScene) {
      const next = phoneStateOnLanding(beatIndex, { isCursorBeat, direction, replayOnAdvance });
      setPhone(next);
      setAnimateFrom(next.messages.length);
      setAnimateNotification(false);
      if (beatIndex === 0 && direction === "forward") {
        // Keys stay held from landing until the notification has dropped in,
        // so there's no gap after the swipe's own hold.
        const release = hold();
        releaseNotification.current = release;
        later(swipeIn.current + NOTIFICATION_DELAY_MS, () => {
          setAnimateNotification(true);
          setPhone((p) => ({ ...p, notification: true }));
          later(NOTIFICATION_HOLD_FALLBACK_MS, release);
        });
      }
    }
    return stopScript;
  }, [inScene, beatIndex, isCursorBeat, direction, replayOnAdvance, hold, later, stopScript]);

  // Native listener: React maps onAnimationEnd to webkitAnimationEnd where
  // AnimationEvent is missing (jsdom), so listen for the standard event.
  const notificationRef = useCallback((el: HTMLButtonElement | null) => {
    if (!el) return;
    const onEnd = () => releaseNotification.current();
    el.addEventListener("animationend", onEnd);
    return () => el.removeEventListener("animationend", onEnd);
  }, []);

  const openThread = () => {
    // The scripted tap goes on to type and send in the same beat: keys stay
    // held from the tap until Send takes over the hold.
    if (inScene && isCursorBeat) {
      const release = hold();
      releaseThread.current = release;
      later(THREAD_HOLD_FALLBACK_MS, release);
    }
    // The broadcast is already in the thread when it opens; it doesn't animate in.
    setAnimateFrom(1);
    setPhone((p) => ({
      ...p,
      notification: false,
      view: "thread",
      messages: [{ from: "them", text: SMS_BROADCAST }],
    }));
  };

  const send = () => {
    const text = phone.draft;
    if (!text) return;
    const release = hold();
    releaseThread.current();
    setPhone((p) => ({ ...p, draft: "", messages: [...p.messages, { from: "me", text }] }));
    later(TYPING_DOTS_AT_MS, () => setTyping(true));
    later(ANSWER_AT_MS, () => {
      setTyping(false);
      setPhone((p) => ({ ...p, messages: [...p.messages, { from: "them", text: SMS_ANSWER }] }));
      release();
    });
  };

  // The reply box grows with the draft so the whole message stays visible.
  useLayoutEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [phone.draft, phone.view]);

  return (
    <PhoneFrame>
      {phone.view === "lock" ? (
        <div className="sms-lock">
          <div className="sms-lock-date">Sunday, October 25</div>
          <div className="sms-lock-time">4:12</div>
          {phone.notification && (
            <button
              type="button"
              data-vt-name={VT.SmsNotification}
              className={`sms-notification${animateNotification ? " sms-notification-in" : ""}`}
              ref={notificationRef}
              onClick={openThread}
            >
              <span className="sms-notification-top">
                <span>MESSAGES</span>
                <span>now</span>
              </span>
              <span className="sms-notification-sender">{SMS_SENDER}</span>
              <span className="sms-notification-preview">{SMS_PREVIEW}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="sms-thread-view">
          <div className="sms-header">
            <div className="sms-avatar">WC</div>
            {SMS_SENDER}
          </div>
          <div className="sms-thread">
            {phone.messages.map((m, i) => (
              <div
                key={i}
                data-sms-bubble={m.from}
                className={`sms-bubble sms-bubble-${m.from}${i >= animateFrom ? " sms-bubble-in" : ""}`}
              >
                {m.text}
              </div>
            ))}
            {typing && (
              <div className="sms-typing" role="status" aria-label="Typing">
                <span />
                <span />
                <span />
              </div>
            )}
          </div>
          <div className="sms-compose">
            <textarea
              data-vt-name={VT.SmsInput}
              className="sms-input"
              ref={inputRef}
              rows={1}
              placeholder="Text Message"
              value={phone.draft}
              onChange={(e) => {
                const draft = e.target.value;
                setPhone((p) => ({ ...p, draft }));
              }}
            />
            <button
              type="button"
              data-vt-name={VT.SmsSendBtn}
              className="sms-send"
              aria-label="Send"
              onClick={send}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </PhoneFrame>
  );
}
