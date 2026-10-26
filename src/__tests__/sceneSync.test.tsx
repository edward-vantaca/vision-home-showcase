import { describe, expect, it } from "vitest";
import { act, fireEvent, render } from "@testing-library/react";
import gsap from "gsap";
import App from "../App";
import { WalkthroughProvider, isWalkthroughBusy, useCursor } from "../walkthrough/cursor";
import { SMS_SCENE_ID } from "../walkthrough/phone/PhoneStage";
import type { Sequence } from "../walkthrough/types";

const portal = { phase: "portal", page: "dashboard", dashboardView: "homeowner", askHoaiOpen: true } as const;

// Two scenes on the same page: the second must still pull the app back there.
const seq: Sequence = [
  { id: "first", page: "dashboard", appState: portal, beats: [{ kind: "idle" }] },
  { id: "second", page: "dashboard", appState: portal, beats: [{ kind: "idle" }] },
];

// A phone scene: no appState of its own; the app underneath follows the app scene.
const phoneScene: Sequence[number] = {
  id: SMS_SCENE_ID,
  page: "dashboard",
  stage: "phone",
  beats: [{ kind: "idle" }, { kind: "idle" }],
};

let nav: ReturnType<typeof useCursor>;

function Probe() {
  nav = useCursor();
  return null;
}

function Next() {
  const { advance } = useCursor();
  return <button type="button" data-testid="next" onClick={advance}>next</button>;
}

function Back() {
  const { back } = useCursor();
  return <button type="button" data-testid="back" onClick={back}>back</button>;
}

function q(container: HTMLElement, uxId: string) {
  return container.querySelector<HTMLElement>(`[data-ux-id="${uxId}"]`);
}

describe("MainApp scene sync", () => {
  it("each scene change returns to the scene's page and closes Quick Actions", () => {
    const { container, getByTestId } = render(
      <WalkthroughProvider sequence={seq}>
        <App />
        <Next />
      </WalkthroughProvider>,
    );

    fireEvent.click(q(container, "sidebar-quick-actions")!);
    fireEvent.click(q(container, "sidebar-quick-actions-arc-request")!);
    fireEvent.click(q(container, "quick-actions-arc-form-fence")!);
    expect(q(container, "arc-form-page")).not.toBeNull();

    fireEvent.click(q(container, "sidebar-quick-actions")!);
    expect(q(container, "quick-actions-modal")).not.toBeNull();

    act(() => {
      fireEvent.click(getByTestId("next"));
    });
    expect(q(container, "arc-form-page")).toBeNull();
    expect(q(container, "dashboard-page")).not.toBeNull();
    expect(q(container, "quick-actions-modal")).toBeNull();
  });

  it("keeps the Ask HOAi panel focused through the app scene: on a phone scene's first beat after ask-hoai, not from beat 1", () => {
    const smsSeq: Sequence = [
      { id: "ask-hoai", page: "dashboard", appState: portal, beats: [{ kind: "idle" }] },
      phoneScene,
      { id: "after", page: "dashboard", appState: portal, beats: [{ kind: "idle" }] },
    ];
    const { container, getByTestId } = render(
      <WalkthroughProvider sequence={smsSeq}>
        <App />
        <Next />
      </WalkthroughProvider>,
    );
    const panel = () => q(container, "askhoai-panel")!;
    const isFocused = () => panel().className.includes("left-1/2");

    expect(isFocused()).toBe(true);
    act(() => {
      fireEvent.click(getByTestId("next"));
    });
    // Beat 0: the panel slides out with the app still in its focused form.
    expect(isFocused()).toBe(true);
    act(() => {
      fireEvent.click(getByTestId("next"));
    });
    // Beat 1: it morphs back to the sidebar off-screen.
    expect(isFocused()).toBe(false);
  });

  it("← from the SMS scene's first beat hard-cuts ask-hoai back to a fresh welcome view", () => {
    const smsSeq: Sequence = [
      { id: "ask-hoai", page: "dashboard", appState: portal, beats: [{ kind: "idle" }] },
      phoneScene,
      { id: "after", page: "dashboard", appState: portal, beats: [{ kind: "idle" }] },
    ];
    const { container, getByTestId, unmount } = render(
      <WalkthroughProvider sequence={smsSeq}>
        <App />
        <Next />
        <Back />
      </WalkthroughProvider>,
    );
    try {
      const panel = () => q(container, "askhoai-panel")!;
      const section = (name: string) => panel().querySelector(`[data-ash-section="${name}"]`);

      // Start the scripted chat and let the welcome -> thread morph commit.
      const textarea = panel().querySelector<HTMLTextAreaElement>('[data-vt-name="wt-askhoai-input"]')!;
      fireEvent.change(textarea, { target: { value: "Can I replace my fence?" } });
      act(() => {
        panel().querySelector<HTMLButtonElement>('[data-vt-name="wt-askhoai-send-btn"]')!.click();
      });
      act(() => {
        gsap.getTweensOf([section("welcome"), section("questions")]).forEach((t) => t.progress(1));
      });
      expect(section("thread")).not.toBeNull();

      act(() => {
        fireEvent.click(getByTestId("next"));
      });
      // Beat 0: still focused, conversation untouched mid-swipe.
      expect(section("thread")).not.toBeNull();

      act(() => {
        fireEvent.click(getByTestId("back"));
      });
      expect(section("thread")).toBeNull();
      expect(section("welcome")).not.toBeNull();
      expect(panel().textContent).not.toContain("Can I replace my fence?");
      expect(isWalkthroughBusy()).toBe(false);
    } finally {
      unmount();
    }
  });

  it("a launcher jump into a phone scene keeps the app on the scene it came from during beat 0", () => {
    const jumpSeq: Sequence = [
      { id: "start", page: "dashboard", appState: portal, beats: [{ kind: "idle" }] },
      { id: "elsewhere", page: "community", appState: { ...portal, page: "community" }, beats: [{ kind: "idle" }] },
      phoneScene,
      { id: "after", page: "dashboard", appState: portal, beats: [{ kind: "idle" }] },
    ];
    const { container, unmount } = render(
      <WalkthroughProvider sequence={jumpSeq}>
        <App />
        <Probe />
      </WalkthroughProvider>,
    );
    try {
      act(() => nav.jumpTo({ sceneIndex: 1, beatIndex: 0 }));
      expect(q(container, "community-feed-page")).not.toBeNull();

      act(() => nav.jumpTo({ sceneIndex: 2, beatIndex: 0 }));
      expect(nav.appSceneId).toBe("elsewhere");
      expect(nav.appPage).toBe("community");
      // The phone scene's own page is the dashboard, but the app slides out as last seen.
      expect(q(container, "community-feed-page")).not.toBeNull();
      expect(q(container, "dashboard-page")).toBeNull();

      act(() => nav.advance());
      // Beat 1, off-screen: the app is already in the next scene's state.
      expect(nav.appSceneId).toBe("after");
      expect(q(container, "dashboard-page")).not.toBeNull();
      expect(q(container, "community-feed-page")).toBeNull();
    } finally {
      unmount();
    }
  });

  it("← out of a phone scene's beat 0 re-applies the previous scene's start state", () => {
    // pageChanger's last beat is a cursor beat that navigates away (here: to
    // the ARC fence form). No overlay runs beats in this test, so the click is
    // made by hand.
    const seq3: Sequence = [
      {
        id: "page-changer",
        page: "dashboard",
        appState: portal,
        beats: [{ kind: "cursor", to: "wt-quick-actions" as never, action: "click" }],
      },
      phoneScene,
      { id: "after", page: "community", appState: { ...portal, page: "community" }, beats: [{ kind: "idle" }] },
    ];
    const { container, unmount } = render(
      <WalkthroughProvider sequence={seq3}>
        <App />
        <Probe />
      </WalkthroughProvider>,
    );
    try {
      fireEvent.click(q(container, "sidebar-quick-actions")!);
      fireEvent.click(q(container, "sidebar-quick-actions-arc-request")!);
      fireEvent.click(q(container, "quick-actions-arc-form-fence")!);
      expect(q(container, "arc-form-page")).not.toBeNull();

      act(() => nav.advance());
      // Phone beat 0: the app slides out exactly as last seen.
      expect(nav.sceneId).toBe(SMS_SCENE_ID);
      expect(q(container, "arc-form-page")).not.toBeNull();

      act(() => nav.back());
      expect(nav.sceneId).toBe("page-changer");
      expect(nav.replayOnAdvance).toBe(true);
      // Back at the scene's start, so → replays the click on a clean dashboard.
      expect(q(container, "arc-form-page")).toBeNull();
      expect(q(container, "dashboard-page")).not.toBeNull();
      expect(q(container, "quick-actions-modal")).toBeNull();
    } finally {
      unmount();
    }
  });

  it("a keepPage scene stays on whatever page the portal shows, from any scene", () => {
    const keepSeq: Sequence = [
      { id: "on-feed", page: "community", appState: { ...portal, page: "community" }, beats: [{ kind: "idle" }] },
      { id: "on-dashboard", page: "dashboard", appState: portal, beats: [{ kind: "idle" }] },
      { id: "keeper", page: "dashboard", appState: portal, keepPage: true, beats: [{ kind: "idle" }] },
    ];
    const { container, unmount } = render(
      <WalkthroughProvider sequence={keepSeq}>
        <App />
        <Probe />
      </WalkthroughProvider>,
    );
    try {
      expect(q(container, "community-feed-page")).not.toBeNull();
      act(() => nav.jumpTo({ sceneIndex: 2, beatIndex: 0 }));
      expect(q(container, "community-feed-page")).not.toBeNull();

      act(() => nav.jumpTo({ sceneIndex: 1, beatIndex: 0 }));
      expect(q(container, "dashboard-page")).not.toBeNull();
      act(() => nav.jumpTo({ sceneIndex: 2, beatIndex: 0 }));
      // Never passes through the feed on the way in.
      expect(q(container, "community-feed-page")).toBeNull();
      expect(q(container, "dashboard-page")).not.toBeNull();
    } finally {
      unmount();
    }
  });
});
