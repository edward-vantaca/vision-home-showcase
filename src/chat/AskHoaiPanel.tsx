import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { History, ChevronRight, Paperclip, ArrowUp, Info, ChevronsRight, X } from "lucide-react";
import { VT } from "../walkthrough/viewTransitionNames";
import { DROP_FILE_EVENT } from "../walkthrough/dropFile";
import { holdBusy } from "../walkthrough/cursor";

// Bind useGSAP to this module's gsap instance. Under Vitest, @gsap/react's CJS
// build can load a second copy of gsap, so without this its context would not
// see (and on unmount would not kill) tweens created here.
gsap.registerPlugin(useGSAP);

type ChatMessage = { role: "user" | "agent"; text: string; attachment?: string };

const AGENT_FENCE_REPLY =
  "Got it — I've read your fence proposal: a 6 ft white vinyl privacy fence, about 120 linear ft along the rear property line.\n\n" +
  "It meets Waterfront's fence guidelines. Want me to fill out the Fence Installation ARC request with these details and attach your proposal?";

// The panel morphs between three `position: fixed` forms. Every animated
// property (left, top/bottom, width, translate) is explicit in each form so
// CSS can interpolate it — never `auto`, and `right` is left unset in all of
// them. z-190 keeps the sidebar above the z-180 white canvas (so it doesn't
// drop under it while the canvas fades out) but below `.wt-root` (z-250) so
// the walkthrough backdrop still blurs it.
const PANEL_MORPH_MS = 700;
const PANEL_TRANSITION = `all ${PANEL_MORPH_MS}ms cubic-bezier(0.65,0,0.35,1)`;
const PANEL_FOCUSED_CLASS =
  "fixed flex overflow-hidden z-[200] top-[6vh] bottom-[6vh] left-1/2 -translate-x-1/2 w-[min(820px,92vw)]";
const PANEL_SIDEBAR_CLASS =
  "hidden lg:flex fixed overflow-hidden z-[190] top-0 bottom-0 left-[calc(100%_-_400px)] translate-x-0 w-[400px]";
const PANEL_COLLAPSED_CLASS =
  "hidden lg:flex fixed overflow-hidden z-[190] top-0 bottom-0 left-full translate-x-0 w-0";

type Props = {
  open: boolean;
  onCollapse: () => void;
  focused?: boolean;
  // True while the walkthrough has landed on the Ask HOAi scene by ← (from the
  // SMS scene's first beat, where the panel is still focused). Rising to true
  // hard-resets the panel, so the next → replays the drop and chat cleanly.
  restart?: boolean;
};

export function AskHoaiIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="73 0 22 21"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path d="M81.367 16.9752C81.367 15.9135 80.5103 15.0522 79.4544 15.0522H75.6295C75.2788 15.0522 74.992 14.7637 74.992 14.4112V2.8731C74.992 2.52055 75.2788 2.2321 75.6295 2.2321H85.1405C86.4526 2.2321 86.4169 0.309082 85.1405 0.309082H75.6295C74.223 0.309082 73.0795 1.45888 73.0795 2.8731V14.4112C73.0795 15.8254 74.223 16.9752 75.6295 16.9752H79.4544V20.1802C79.4544 20.4246 79.5859 20.6449 79.8051 20.7531C80.0242 20.8613 80.2832 20.8372 80.4744 20.693L81.1558 20.1802L81.359 20.028L81.367 20.02L85.4032 16.9752H90.9295C92.3359 16.9752 93.4795 15.8254 93.4795 14.4112V8.94574C93.4795 7.68622 91.567 7.68622 91.567 8.94574V14.4112C91.567 14.7637 91.2801 15.0522 90.9295 15.0522H85.4032C84.9888 15.0522 84.5864 15.1884 84.2557 15.4368L81.367 17.6162V16.9752Z" />
      <path d="M91.4931 1.44282C91.4173 1.47161 91.3668 1.54443 91.3668 1.62571C91.3668 1.707 91.4173 1.77982 91.4931 1.80861L92.4447 2.16762L92.8017 3.12441C92.8303 3.20063 92.9027 3.25142 92.9836 3.25142C93.0644 3.25142 93.1368 3.20063 93.1655 3.12441L93.5225 2.16762L94.4741 1.80861C94.5499 1.77982 94.6004 1.707 94.6004 1.62571C94.6004 1.54443 94.5499 1.47161 94.4741 1.44282L93.5225 1.08381L93.1655 0.12701C93.1368 0.0508054 93.0644 0 92.9836 0C92.9027 0 92.8303 0.0508054 92.8017 0.12701L92.4447 1.08381L91.4931 1.44282ZM86.134 4.06428C86.0379 4.10833 85.9773 4.20484 85.9773 4.3115C85.9773 4.41824 86.0379 4.51303 86.134 4.55707L86.4203 4.69087L86.5567 4.75349L86.5668 4.7586L88.0539 5.44953L88.7411 6.94317L88.7461 6.95332L88.8085 7.0905L88.9415 7.38005C88.9853 7.47656 89.0813 7.53752 89.1858 7.53752C89.2901 7.53752 89.3862 7.47656 89.4299 7.38005L89.563 7.0905L89.6253 6.95332L89.6303 6.94317L90.3175 5.4478L91.8046 4.7586L91.8148 4.75349L91.9511 4.69087L92.2392 4.55707C92.3352 4.51303 92.3958 4.41651 92.3958 4.3115C92.3958 4.2065 92.3352 4.10998 92.2392 4.06601L91.9511 3.93221L91.8148 3.86952L91.8046 3.86448L90.3175 3.17353L89.632 1.67821L89.627 1.66805L89.5647 1.52919L89.4316 1.23961C89.3878 1.14308 89.2918 1.08212 89.1874 1.08212C89.083 1.08212 88.987 1.14308 88.9432 1.23961L88.8102 1.52919L88.7478 1.66635L88.7427 1.67652L88.0556 3.17184L86.5685 3.86276L86.5584 3.86787L86.4219 3.93048L86.134 4.06428Z" />
    </svg>
  );
}

function AskHoaiWordmark() {
  return (
    <svg
      width="95"
      height="21"
      viewBox="0 0 95 21"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-auto"
      role="img"
      aria-labelledby="askhoai-wordmark-title"
    >
      <title id="askhoai-wordmark-title">Ask HOAi</title>
      <path
        d="M0.42 15.436L4.275 4.936H5.91L9.765 15.436H8.16L5.085 6.736L1.995 15.436H0.42ZM2.16 12.841L2.58 11.641H7.515L7.935 12.841H2.16ZM14.111 15.616C13.471 15.616 12.911 15.511 12.431 15.301C11.951 15.091 11.571 14.796 11.291 14.416C11.011 14.036 10.841 13.591 10.781 13.081H12.311C12.361 13.321 12.456 13.541 12.596 13.741C12.746 13.941 12.946 14.101 13.196 14.221C13.456 14.341 13.761 14.401 14.111 14.401C14.441 14.401 14.711 14.356 14.921 14.266C15.141 14.166 15.301 14.036 15.401 13.876C15.501 13.706 15.551 13.526 15.551 13.336C15.551 13.056 15.481 12.846 15.341 12.706C15.211 12.556 15.011 12.441 14.741 12.361C14.481 12.271 14.166 12.191 13.796 12.121C13.446 12.061 13.106 11.981 12.776 11.881C12.456 11.771 12.166 11.636 11.906 11.476C11.656 11.316 11.456 11.116 11.306 10.876C11.156 10.626 11.081 10.321 11.081 9.961C11.081 9.531 11.196 9.146 11.426 8.806C11.656 8.456 11.981 8.186 12.401 7.996C12.831 7.796 13.336 7.696 13.916 7.696C14.756 7.696 15.431 7.896 15.941 8.296C16.451 8.696 16.751 9.261 16.841 9.991H15.386C15.346 9.651 15.196 9.391 14.936 9.211C14.676 9.021 14.331 8.926 13.901 8.926C13.471 8.926 13.141 9.011 12.911 9.181C12.681 9.351 12.566 9.576 12.566 9.856C12.566 10.036 12.631 10.196 12.761 10.336C12.891 10.476 13.081 10.596 13.331 10.696C13.591 10.786 13.906 10.871 14.276 10.951C14.806 11.051 15.281 11.176 15.701 11.326C16.121 11.476 16.456 11.696 16.706 11.986C16.956 12.276 17.081 12.691 17.081 13.231C17.091 13.701 16.971 14.116 16.721 14.476C16.481 14.836 16.136 15.116 15.686 15.316C15.246 15.516 14.721 15.616 14.111 15.616ZM23.6021 15.436L20.1221 11.296L23.2721 7.876H25.0871L21.3371 11.881V10.756L25.4921 15.436H23.6021ZM18.8471 15.436V4.636H20.3471V15.436H18.8471ZM37.3452 15.436V4.936H38.8452V15.436H37.3452ZM30.6702 15.436V4.936H32.1702V15.436H30.6702ZM31.9152 10.696V9.466H37.6752V10.696H31.9152ZM45.7663 15.616C44.7563 15.616 43.8663 15.391 43.0963 14.941C42.3363 14.481 41.7363 13.846 41.2963 13.036C40.8663 12.216 40.6513 11.266 40.6513 10.186C40.6513 9.116 40.8663 8.176 41.2963 7.366C41.7363 6.546 42.3363 5.906 43.0963 5.446C43.8663 4.986 44.7563 4.756 45.7663 4.756C46.7963 4.756 47.6963 4.986 48.4663 5.446C49.2363 5.906 49.8313 6.546 50.2513 7.366C50.6813 8.176 50.8963 9.116 50.8963 10.186C50.8963 11.266 50.6813 12.216 50.2513 13.036C49.8313 13.846 49.2363 14.481 48.4663 14.941C47.6963 15.391 46.7963 15.616 45.7663 15.616ZM45.7813 14.281C46.5013 14.281 47.1313 14.116 47.6713 13.786C48.2113 13.456 48.6263 12.986 48.9163 12.376C49.2163 11.766 49.3663 11.036 49.3663 10.186C49.3663 9.336 49.2163 8.606 48.9163 7.996C48.6263 7.386 48.2113 6.921 47.6713 6.601C47.1313 6.271 46.5013 6.106 45.7813 6.106C45.0613 6.106 44.4313 6.271 43.8913 6.601C43.3513 6.921 42.9313 7.386 42.6313 7.996C42.3313 8.606 42.1813 9.336 42.1813 10.186C42.1813 11.036 42.3313 11.766 42.6313 12.376C42.9313 12.986 43.3513 13.456 43.8913 13.786C44.4313 14.116 45.0613 14.281 45.7813 14.281ZM51.3087 15.436L55.1637 4.936H56.7987L60.6537 15.436H59.0487L55.9737 6.736L52.8837 15.436H51.3087ZM53.0487 12.841L53.4687 11.641H58.4037L58.8237 12.841H53.0487ZM62.1797 15.436V7.876H63.6797V15.436H62.1797ZM62.9447 6.451C62.6547 6.451 62.4147 6.361 62.2247 6.181C62.0447 6.001 61.9547 5.771 61.9547 5.491C61.9547 5.221 62.0447 5.001 62.2247 4.831C62.4147 4.651 62.6547 4.561 62.9447 4.561C63.2247 4.561 63.4597 4.651 63.6497 4.831C63.8397 5.001 63.9347 5.221 63.9347 5.491C63.9347 5.771 63.8397 6.001 63.6497 6.181C63.4597 6.361 63.2247 6.451 62.9447 6.451Z"
        fill="#1D70DC"
      />
      <g clipPath="url(#askhoai-wordmark-clip)">
        <mask
          id="askhoai-wordmark-mask"
          maskUnits="userSpaceOnUse"
          x="73"
          y="0"
          width="22"
          height="21"
          style={{ maskType: "luminance" }}
        >
          <path d="M94.6247 0H73.0795V20.872H94.6247V0Z" fill="white" />
        </mask>
        <g mask="url(#askhoai-wordmark-mask)">
          <path
            d="M81.367 16.9752C81.367 15.9135 80.5103 15.0522 79.4544 15.0522H75.6295C75.2788 15.0522 74.992 14.7637 74.992 14.4112V2.8731C74.992 2.52055 75.2788 2.2321 75.6295 2.2321H85.1405C86.4526 2.2321 86.4169 0.309082 85.1405 0.309082H75.6295C74.223 0.309082 73.0795 1.45888 73.0795 2.8731V14.4112C73.0795 15.8254 74.223 16.9752 75.6295 16.9752H79.4544V20.1802C79.4544 20.4246 79.5859 20.6449 79.8051 20.7531C80.0242 20.8613 80.2832 20.8372 80.4744 20.693L81.1558 20.1802L81.359 20.028L81.367 20.02L85.4032 16.9752H90.9295C92.3359 16.9752 93.4795 15.8254 93.4795 14.4112V8.94574C93.4795 7.68622 91.567 7.68622 91.567 8.94574V14.4112C91.567 14.7637 91.2801 15.0522 90.9295 15.0522H85.4032C84.9888 15.0522 84.5864 15.1884 84.2557 15.4368L81.367 17.6162V16.9752Z"
            fill="#1D70DC"
          />
          <path
            d="M91.4931 1.44282C91.4173 1.47161 91.3668 1.54443 91.3668 1.62571C91.3668 1.707 91.4173 1.77982 91.4931 1.80861L92.4447 2.16762L92.8017 3.12441C92.8303 3.20063 92.9027 3.25142 92.9836 3.25142C93.0644 3.25142 93.1368 3.20063 93.1655 3.12441L93.5225 2.16762L94.4741 1.80861C94.5499 1.77982 94.6004 1.707 94.6004 1.62571C94.6004 1.54443 94.5499 1.47161 94.4741 1.44282L93.5225 1.08381L93.1655 0.12701C93.1368 0.0508054 93.0644 0 92.9836 0C92.9027 0 92.8303 0.0508054 92.8017 0.12701L92.4447 1.08381L91.4931 1.44282ZM86.134 4.06428C86.0379 4.10833 85.9773 4.20484 85.9773 4.3115C85.9773 4.41824 86.0379 4.51303 86.134 4.55707L86.4203 4.69087L86.5567 4.75349L86.5668 4.7586L88.0539 5.44953L88.7411 6.94317L88.7461 6.95332L88.8085 7.0905L88.9415 7.38005C88.9853 7.47656 89.0813 7.53752 89.1858 7.53752C89.2901 7.53752 89.3862 7.47656 89.4299 7.38005L89.563 7.0905L89.6253 6.95332L89.6303 6.94317L90.3175 5.4478L91.8046 4.7586L91.8148 4.75349L91.9511 4.69087L92.2392 4.55707C92.3352 4.51303 92.3958 4.41651 92.3958 4.3115C92.3958 4.2065 92.3352 4.10998 92.2392 4.06601L91.9511 3.93221L91.8148 3.86952L91.8046 3.86448L90.3175 3.17353L89.632 1.67821L89.627 1.66805L89.5647 1.52919L89.4316 1.23961C89.3878 1.14308 89.2918 1.08212 89.1874 1.08212C89.083 1.08212 88.987 1.14308 88.9432 1.23961L88.8102 1.52919L88.7478 1.66635L88.7427 1.67652L88.0556 3.17184L86.5685 3.86276L86.5584 3.86787L86.4219 3.93048L86.134 4.06428Z"
            fill="#1D70DC"
          />
        </g>
      </g>
      <defs>
        <clipPath id="askhoai-wordmark-clip">
          <rect width="21.5453" height="20.872" fill="white" transform="translate(73.0795)" />
        </clipPath>
      </defs>
    </svg>
  );
}

const COMMON_QUESTIONS = [
  "What is my current account balance?",
  "How do I submit an architectural modification (ARC) request and track status?",
  "I received a violation—what is it for and how do I resolve/appeal it?",
  "What is the process to request a new pool key?",
];

export default function AskHoaiPanel({ open, onCollapse, focused = false, restart = false }: Props) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [agentTyping, setAgentTyping] = useState(false);
  // File dropped on the input (the walkthrough drags one in), sent with the
  // next message.
  const [attachment, setAttachment] = useState<string | null>(null);
  // Every timer the scripted conversation schedules is tracked here so leaving
  // the scene (or unmounting) can stop the whole script at once. Timeouts and
  // intervals are kept apart because fake timers reject cross-clearing.
  const scriptTimeoutsRef = useRef(new Set<ReturnType<typeof setTimeout>>());
  const scriptIntervalsRef = useRef(new Set<ReturnType<typeof setInterval>>());
  const stopTypingRef = useRef<(() => void) | null>(null);
  // Holds the walkthrough busy (presenter keys ignored) from Send until the
  // scripted chat has finished streaming its last message.
  const releaseScriptBusyRef = useRef<(() => void) | null>(null);
  // Pending deferred reset after leaving the scene (see the !focused effect).
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // The thread's fade-out once that deferred reset fires; non-null while in flight.
  const resetFadeRef = useRef<gsap.core.Tween | null>(null);
  const wasFocusedRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  // Scope for the welcome -> thread morph. The thread-view input sits outside
  // the scrolling region, so queries run against the panel root, not scrollRef.
  const panelRootRef = useRef<HTMLElement>(null);
  // The in-flight phase-1 tween of the welcome -> thread morph plus the commit
  // it will run on completion. Non-null only while a morph is in flight.
  const morphRef = useRef<{ tween: gsap.core.Tween; commit: () => void } | null>(null);
  // Every tween created via contextSafe belongs to this panel's gsap.context,
  // which useGSAP reverts (kills) on unmount — StrictMode-safe.
  const { contextSafe } = useGSAP({ scope: panelRootRef });

  const visible = open || focused;
  const hasConversation = messages.length > 0 || agentTyping;

  function later(fn: () => void, ms: number) {
    const timeouts = scriptTimeoutsRef.current;
    const id = setTimeout(() => {
      timeouts.delete(id);
      fn();
    }, ms);
    timeouts.add(id);
  }

  /** Starts a tracked interval; returns a function that stops it. */
  function every(fn: (stop: () => void) => void, ms: number): () => void {
    const intervals = scriptIntervalsRef.current;
    const stop = () => {
      clearInterval(id);
      intervals.delete(id);
    };
    const id = setInterval(() => fn(stop), ms);
    intervals.add(id);
    return stop;
  }

  function stopScript() {
    scriptTimeoutsRef.current.forEach((id) => clearTimeout(id));
    scriptTimeoutsRef.current.clear();
    scriptIntervalsRef.current.forEach((id) => clearInterval(id));
    scriptIntervalsRef.current.clear();
    stopTypingRef.current = null;
    releaseScriptBusy();
  }

  function releaseScriptBusy() {
    releaseScriptBusyRef.current?.();
    releaseScriptBusyRef.current = null;
  }

  function cancelPendingReset(): boolean {
    if (resetFadeRef.current) {
      // revert() so the thread isn't left half-faded if it's ever shown again.
      resetFadeRef.current.revert();
      resetFadeRef.current = null;
      return true;
    }
    if (resetTimerRef.current === null) return false;
    clearTimeout(resetTimerRef.current);
    resetTimerRef.current = null;
    return true;
  }

  function resetConversation() {
    setMessages([]);
    setAgentTyping(false);
    setInput("");
    setAttachment(null);
  }

  // Thread -> welcome, once the panel is back in the sidebar: the reverse of
  // the welcome -> thread morph. (1) thread + input fade out, (2) the reset is
  // committed synchronously via flushSync, (3) welcome, input, and common
  // questions fade up into place. With no thread on screen it just resets.
  const fadeToWelcome = contextSafe(() => {
    const scope = panelRootRef.current;
    const threadEl = scope?.querySelector<HTMLElement>('[data-ash-section="thread"]');
    const inputEl = scope?.querySelector<HTMLElement>('[data-ash-section="input"]');
    if (!scope || !threadEl || !inputEl) {
      resetConversation();
      return;
    }
    resetFadeRef.current = gsap.to([threadEl, inputEl], {
      opacity: 0,
      duration: 0.2,
      ease: "power1.in",
      onComplete: contextSafe(() => {
        resetFadeRef.current = null;
        flushSync(resetConversation);
        const sections = ["welcome", "input", "questions"]
          .map((name) => scope.querySelector<HTMLElement>(`[data-ash-section="${name}"]`))
          .filter((el): el is HTMLElement => el !== null);
        gsap.fromTo(
          sections,
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: 0.4, ease: "power2.out", stagger: 0.06, clearProps: "opacity,transform" },
        );
      }),
    });
  });

  // When the walkthrough advances past the Ask HOAi scene (focused flips to
  // false), stop the scripted conversation immediately, then fade back to the
  // welcome view once the 700ms panel morph has finished so the thread doesn't
  // swap mid-morph. Re-focusing before then resets right away. ← into ask-hoai
  // with `focused` unchanged is handled by the `restart` effect below.
  useEffect(() => {
    if (!focused) {
      // Drop an in-flight morph so it can't commit into the reset panel.
      // revert() (not kill()) restores welcome/questions' pre-tween inline
      // styles so re-entering the scene doesn't show them half-faded.
      if (morphRef.current) {
        morphRef.current.tween.revert();
        morphRef.current = null;
      }
      stopScript();
      cancelPendingReset();
      // Only an actual exit has a conversation (and a morph) to wait out.
      if (wasFocusedRef.current) {
        resetTimerRef.current = setTimeout(() => {
          resetTimerRef.current = null;
          fadeToWelcome();
        }, PANEL_MORPH_MS);
      }
    } else if (cancelPendingReset()) {
      resetConversation();
    }
    wasFocusedRef.current = focused;
    // stopScript/cancelPendingReset/resetConversation only touch refs and setters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focused]);

  // ← back into ask-hoai with the app scene unchanged (e.g. from a phone
  // scene's first beat) keeps `focused` true, so the effect above never runs.
  // Restart the scene: stop the script and reset at once, with no fade.
  useEffect(() => {
    if (!restart) return;
    if (morphRef.current) {
      morphRef.current.tween.revert();
      morphRef.current = null;
    }
    stopScript();
    cancelPendingReset();
    resetConversation();
    // stopScript/cancelPendingReset/resetConversation only touch refs and setters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restart]);

  // A cursor "drop" stop lands a file on the input; it bubbles up to the panel.
  useEffect(() => {
    const root = panelRootRef.current;
    if (!root) return;
    const onDrop = (event: Event) => setAttachment((event as CustomEvent<{ name: string }>).detail.name);
    root.addEventListener(DROP_FILE_EVENT, onDrop);
    return () => root.removeEventListener(DROP_FILE_EVENT, onDrop);
  }, []);

  // Unmount: stop the script and any pending reset.
  useEffect(
    () => () => {
      stopScript();
      cancelPendingReset();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // Sends a user message. From the welcome view this runs the welcome ->
  // thread morph: (1) welcome + common questions fade up and out, (2) the
  // state change is committed synchronously via flushSync, (3) the new
  // thread-view input is FLIPped from the old input's position to its own and
  // the thread fades in. From the thread view (or if any element is missing)
  // it commits immediately. handleSend ignores sends while a morph is in
  // flight; as a defensive fallback for any other caller, a push during a
  // morph reverts it, flushes its pending commit, then commits directly —
  // order is kept and the UI is never left half-faded.
  const pushUserMessage = contextSafe((text: string, attached?: string) => {
    const commit = () => {
      setMessages((prev) => [...prev, { role: "user", text, attachment: attached }]);
      setInput("");
      setAttachment(null);
    };

    if (morphRef.current) {
      const pending = morphRef.current;
      morphRef.current = null;
      pending.tween.revert();
      pending.commit();
      commit();
      return;
    }

    const scope = panelRootRef.current;
    const welcomeEl = scope?.querySelector<HTMLElement>('[data-ash-section="welcome"]');
    const questionsEl = scope?.querySelector<HTMLElement>('[data-ash-section="questions"]');
    const startInputEl = scope?.querySelector<HTMLElement>('[data-ash-section="input"]');
    if (!scope || !welcomeEl || !questionsEl || !startInputEl) {
      commit();
      return;
    }

    const startTop = startInputEl.getBoundingClientRect().top;

    const tween = gsap.to([welcomeEl, questionsEl], {
      opacity: 0,
      y: -16,
      duration: 0.35,
      ease: "power2.in",
      onComplete: contextSafe(() => {
        morphRef.current = null;
        flushSync(commit);
        // The thread view renders a different input container; the welcome
        // one is detached now, so re-query and FLIP the new node.
        const newInputEl = scope.querySelector<HTMLElement>('[data-ash-section="input"]');
        if (newInputEl) {
          const newTop = newInputEl.getBoundingClientRect().top;
          gsap.fromTo(
            newInputEl,
            { y: startTop - newTop },
            { y: 0, duration: 0.5, ease: "power2.out", clearProps: "transform" },
          );
        }
        const threadEl = scope.querySelector<HTMLElement>('[data-ash-section="thread"]');
        if (threadEl) {
          gsap.fromTo(
            threadEl,
            { opacity: 0 },
            { opacity: 1, duration: 0.5, ease: "power2.out", clearProps: "opacity" },
          );
        }
      }),
    });
    morphRef.current = { tween, commit };
  });

  // Streams an agent message into the thread one chunk at a time. Invokes
  // `onDone` after the final chunk is committed so the caller can chain the
  // next step of the scripted conversation.
  function typeAgentMessage(full: string, onDone?: () => void) {
    setMessages((prev) => [...prev, { role: "agent", text: "" }]);
    let cursor = 0;
    stopTypingRef.current?.();
    stopTypingRef.current = every((stop) => {
      cursor = Math.min(full.length, cursor + 3);
      setMessages((prev) => {
        const copy = prev.slice();
        const last = copy[copy.length - 1];
        if (last && last.role === "agent") {
          copy[copy.length - 1] = { role: "agent", text: full.slice(0, cursor) };
        }
        return copy;
      });
      requestAnimationFrame(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      });
      if (cursor >= full.length) {
        stop();
        stopTypingRef.current = null;
        if (onDone) onDone();
      }
    }, 25);
  }

  function animateUserFollowUp() {
    const text = "Yes, that would be amazing!";
    let cursor = 0;
    every((stop) => {
      cursor = Math.min(text.length, cursor + 1);
      setInput(text.slice(0, cursor));
      if (cursor >= text.length) {
        stop();
        // Hold a beat so the finished input is visible, then send it, then
        // chain the agent's acknowledgement.
        later(() => {
          pushUserMessage(text);
          later(() => setAgentTyping(true), 500);
          later(() => {
            setAgentTyping(false);
            typeAgentMessage("Ok, I'll get started. Just a moment.", releaseScriptBusy);
          }, 1500);
        }, 500);
      }
    }, 55);
  }

  function handleSend() {
    // The input is only cleared when the morph commits, so Send stays enabled
    // during the ~350ms fade. Ignore sends while a morph is in flight — at this
    // entry point, so the scripted agent chain below isn't scheduled twice.
    if (morphRef.current) return;
    const text = input.trim();
    if (!text) return;
    // Only the walkthrough's scripted chat (focused) blocks presenter keys; a
    // manual send in the sidebar takes no hold.
    if (focused) {
      releaseScriptBusy();
      releaseScriptBusyRef.current = holdBusy();
    }
    // Morph welcome/questions out, slide the input down to the chat footer,
    // and fade the first user bubble in — all in one browser-driven transition
    // so the layout change feels like one motion instead of a jump.
    pushUserMessage(text, attachment ?? undefined);
    // Short pause, then show the typing indicator.
    later(() => setAgentTyping(true), 500);
    // Then type out the first reply; when it finishes, chain the user's follow-up.
    later(() => {
      setAgentTyping(false);
      typeAgentMessage(AGENT_FENCE_REPLY, () => {
        later(animateUserFollowUp, 1400);
      });
    }, 1900);
  }

  return (
    <aside
      ref={panelRootRef}
      data-ux-id="askhoai-panel"
      aria-hidden={!visible}
      style={{ transition: PANEL_TRANSITION }}
      className={focused ? PANEL_FOCUSED_CLASS : open ? PANEL_SIDEBAR_CLASS : PANEL_COLLAPSED_CLASS}
    >
      <div className={`flex flex-col h-full w-full bg-white ${focused ? "" : "min-w-[400px] border-l border-[#e5eaf0]"}`}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b border-[#e5eaf0]"
      >
        <AskHoaiWordmark />
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] rounded-md border border-[#e5eaf0] text-[#262630] hover:bg-black/[0.03]"
          >
            <History size={14} /> History
          </button>
          <button
            type="button"
            aria-label="Collapse panel"
            onClick={onCollapse}
            className="p-1.5 rounded-md border border-[#e5eaf0] text-[#262630] hover:bg-black/[0.03]"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Content */}
      {hasConversation ? (
        <>
          <div ref={scrollRef} data-ash-section="thread" className="flex-1 overflow-y-auto px-5 pt-6 pb-4 flex flex-col gap-3">
            {messages.map((m, i) => (
              <MessageBubble key={i} role={m.role} text={m.text} attachment={m.attachment} />
            ))}
            {agentTyping && <TypingDots />}
          </div>
          <div
            data-ash-section="input"
            data-vt-name={VT.AskHoaiDropZone}
            className="mx-5 mb-5 border-2 border-[#247ae4] rounded-xl p-3 bg-white"
          >
            <ChatInput
              input={input}
              onChange={setInput}
              onSend={handleSend}
              attachment={attachment}
              onRemoveAttachment={() => setAttachment(null)}
            />
          </div>
        </>
      ) : (
        <div className="flex-1 overflow-y-auto px-5 pt-6 pb-4">
          <div data-ash-section="welcome">
            <h2 className="font-['DM_Sans:Bold',sans-serif] font-bold text-[22px] text-[#262630] leading-tight">
              Welcome back, Alex Johnson
            </h2>
            <p className="text-[13px] text-[#5a5a66] mt-1">How can I help you today?</p>
          </div>

          {/* Input */}
          <div
            data-ash-section="input"
            data-vt-name={VT.AskHoaiDropZone}
            className="mt-5 border-2 border-[#247ae4] rounded-xl p-3 bg-white"
          >
            <ChatInput
              input={input}
              onChange={setInput}
              onSend={handleSend}
              attachment={attachment}
              onRemoveAttachment={() => setAttachment(null)}
            />
          </div>

          {/* Common questions */}
          <div data-ash-section="questions">
            <p className="text-[11px] font-semibold text-[#8a8a96] tracking-[0.1em] mt-6 mb-3">
              COMMON QUESTIONS:
            </p>
            <div className="flex flex-col gap-2">
              {COMMON_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setInput(q)}
                  className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg bg-[#f4f6f9] hover:bg-[#e8ecf3] text-left text-[13px] leading-snug text-[#262630]"
                >
                  <span className="flex-1">{q}</span>
                  <ChevronsRight size={14} className="text-[#8a8a96] shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-5 py-3 border-t border-[#e5eaf0]">
        <p className="text-center text-[11px] text-[#8a8a96] mb-2">Powered by HOAi</p>
        <div className="flex items-start gap-2 px-3 py-2 border border-[#e5eaf0] rounded-md">
          <Info size={14} className="text-[#8a8a96] shrink-0 mt-0.5" />
          <p className="text-[11px] text-[#5a5a66] leading-snug">
            AI-generated responses may contain errors. Please verify before acting.
          </p>
        </div>
      </div>
      </div>
    </aside>
  );
}

function FileCard({ name, uxId, onRemove }: { name: string; uxId: string; onRemove?: () => void }) {
  return (
    <div
      data-ux-id={uxId}
      className="flex items-center gap-2.5 w-fit max-w-full rounded-lg border border-[#e2e8f0] bg-white py-2 pl-2 pr-3 shadow-[0_2px_8px_rgba(18,17,48,0.06)]"
    >
      <span className="grid place-items-center shrink-0 w-[26px] h-[32px] rounded-[4px] bg-[#e5484d] text-white text-[8px] font-bold tracking-[0.04em]">
        PDF
      </span>
      <span className="flex flex-col min-w-0">
        <span className="truncate text-[13px] font-medium text-[#262630]">{name}</span>
        <span className="text-[11px] text-[#8a8a96]">PDF · 1.2 MB</span>
      </span>
      {onRemove && (
        <button type="button" aria-label={`Remove ${name}`} onClick={onRemove} className="ml-1 p-0.5 rounded text-[#8a8a96] hover:text-[#262630]">
          <X size={13} />
        </button>
      )}
    </div>
  );
}

function ChatInput({
  input,
  onChange,
  onSend,
  attachment,
  onRemoveAttachment,
}: {
  input: string;
  onChange: (v: string) => void;
  onSend: () => void;
  attachment: string | null;
  onRemoveAttachment: () => void;
}) {
  return (
    <>
      {attachment && (
        <div className="mb-2 animate-[askhoai-file-in_320ms_cubic-bezier(0.34,1.56,0.64,1)]">
          <FileCard name={attachment} uxId="askhoai-attachment-chip" onRemove={onRemoveAttachment} />
        </div>
      )}
      <textarea
        value={input}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Hello! How can I help you today?"
        data-vt-name={VT.AskHoaiInput}
        className="w-full resize-none outline-none text-[14px] placeholder:text-[#9a9aa6] bg-transparent"
        rows={2}
      />
      <div className="flex justify-end gap-2 mt-2">
        <button
          type="button"
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1a1a24] text-white text-[13px] rounded-full hover:bg-black"
        >
          <Paperclip size={13} /> Attach
        </button>
        <button
          type="button"
          data-vt-name={VT.AskHoaiSendBtn}
          onClick={onSend}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#247ae4] text-white text-[13px] rounded-full hover:bg-[#1d6fd4] disabled:bg-[#8ab6ec] disabled:opacity-70 transition-[background-color,opacity] duration-300"
          disabled={!input.trim()}
        >
          <ArrowUp size={13} /> Send
        </button>
      </div>
    </>
  );
}

function MessageBubble({ role, text, attachment }: { role: "user" | "agent"; text: string; attachment?: string }) {
  if (role === "user") {
    return (
      <div className="self-end max-w-[80%] flex flex-col items-end gap-1.5">
        {attachment && <FileCard name={attachment} uxId="askhoai-message-attachment" />}
        <div className="bg-[#247ae4] text-white text-[14px] leading-relaxed rounded-2xl rounded-br-md px-4 py-2.5 shadow-sm">
          {text}
        </div>
      </div>
    );
  }
  return (
    <div className="self-start max-w-[85%] flex items-start gap-2">
      <div className="shrink-0 w-7 h-7 rounded-full bg-[#f0f4fb] text-[#1D70DC] grid place-items-center">
        <AskHoaiIcon className="w-4 h-4" />
      </div>
      <div className="bg-[#f4f6f9] text-[#262630] text-[14px] leading-relaxed rounded-2xl rounded-bl-md px-4 py-2.5 whitespace-pre-wrap">
        {text}
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="self-start flex items-center gap-2">
      <div className="shrink-0 w-7 h-7 rounded-full bg-[#f0f4fb] text-[#1D70DC] grid place-items-center">
        <AskHoaiIcon className="w-4 h-4" />
      </div>
      <div className="bg-[#f4f6f9] rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-[#8a8a96] animate-[askhoai-dot_1s_ease-in-out_infinite]" style={{ animationDelay: "0ms" }} />
        <span className="w-1.5 h-1.5 rounded-full bg-[#8a8a96] animate-[askhoai-dot_1s_ease-in-out_infinite]" style={{ animationDelay: "160ms" }} />
        <span className="w-1.5 h-1.5 rounded-full bg-[#8a8a96] animate-[askhoai-dot_1s_ease-in-out_infinite]" style={{ animationDelay: "320ms" }} />
      </div>
    </div>
  );
}
