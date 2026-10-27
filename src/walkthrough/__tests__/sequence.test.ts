import { PAGE_LOAD_MS } from "../../pageLoad";
import { describe, it, expect } from "vitest";
import { homeVisionSequence } from "../scenes";
import { VT } from "../viewTransitionNames";
import { SMS_REPLY } from "../phone/phoneState";
import { ELECTIONS_RESULTS_SIGNAL } from "../signal";

const vtValues = new Set(Object.values(VT));

describe("homeVisionSequence", () => {
  it("has at least one scene", () => {
    expect(homeVisionSequence.length).toBeGreaterThan(0);
  });

  it("every targeted beat references a known VT name", () => {
    for (const scene of homeVisionSequence) {
      for (const beat of scene.beats) {
        if (beat.kind === "highlight" || beat.kind === "lift" || beat.kind === "expand") {
          expect(vtValues.has(beat.target as any)).toBe(true);
        }
        if (beat.kind === "cursor") {
          expect(vtValues.has(beat.to as any)).toBe(true);
        }
      }
    }
  });

  it("scrolls the dashboard to the bottom and back to the top between Enter portal and Payments", () => {
    const ids = homeVisionSequence.map((s) => s.id);
    const portal = ids.indexOf("go-to-portal");
    expect(ids.slice(portal, portal + 3)).toEqual(["go-to-portal", "dashboard", "payments"]);
    const dashboard = homeVisionSequence[portal + 1];
    expect(dashboard.beats).toHaveLength(1);
    const [tour] = dashboard.beats;
    if (tour.kind !== "cursor") throw new Error("expected a cursor beat");
    // Opens on the scroll itself, so the pointer doesn't travel anywhere.
    expect(tour).toMatchObject({ to: VT.DashboardPage, action: "scroll", holdMs: 3000 });
    expect(tour.then).toEqual([
      expect.objectContaining({ to: VT.DashboardPage, action: "scroll", scrollToTop: true }),
    ]);
    // Same app state as Payments, so entering Payments changes nothing but the lift.
    const payments = homeVisionSequence[portal + 2];
    expect(dashboard.appState).toEqual(payments.appState);
  });

  it("every portal scene after Payments shows the balance paid, and none before it", () => {
    const ids = homeVisionSequence.map((s) => s.id);
    const payments = ids.indexOf("payments");
    homeVisionSequence.forEach((scene, i) => {
      if (scene.appState?.phase !== "portal") return;
      expect([scene.id, scene.appState.balancePaid ?? false]).toEqual([scene.id, i > payments]);
    });
  });

  it("ends on a still dashboard after the broadcast SMS and elections so the panel returns to the sidebar", () => {
    const ids = homeVisionSequence.map((s) => s.id);
    expect(ids.slice(-7)).toEqual(["ask-hoai", "community-feed", "offers", "amenity-reservation", "broadcast-sms", "elections", "closing-dashboard"]);
    const closing = homeVisionSequence[homeVisionSequence.length - 1];
    expect(closing.appState?.askHoaiOpen).toBe(true);
    expect(closing.beats.every((b) => b.kind === "idle")).toBe(true);
  });

  it("Community feed: waits on the dashboard, then View All, scroll to the end and back to Forgotten Island, lift it, put it back", () => {
    const feed = homeVisionSequence.find((s) => s.id === "community-feed");
    if (!feed) throw new Error("no community-feed scene");
    expect(feed.appState?.page).toBe("dashboard");
    expect(feed.reenterAtStart).toBe(true);
    expect(feed.beats.map((b) => b.kind)).toEqual(["idle", "cursor", "lift", "idle"]);
    const [, open, lift] = feed.beats;
    if (open.kind !== "cursor" || lift.kind !== "lift") throw new Error("unexpected beats");
    expect(open.to).toBe(VT.DashboardFeedViewAll);
    // Down to the last post, then back up to Forgotten Island.
    expect(open.then).toEqual([
      expect.objectContaining({ to: VT.CommunityFeedPage, action: "scroll" }),
      expect.objectContaining({ to: VT.CommunityFeedPage, action: "scroll", scrollTo: VT.FeedPostForgottenIsland }),
    ]);
    expect(open.then?.[0].scrollTo).toBeUndefined();
    expect(lift.target).toBe(VT.FeedPostForgottenIsland);
  });

  it("Offers: from the feed, click Offers in the sidebar, then Home, each held until its page loads", () => {
    const offers = homeVisionSequence.find((s) => s.id === "offers");
    if (!offers) throw new Error("no offers scene");
    // Not tied to the feed: it starts from whatever page the portal is on.
    expect(offers.keepPage).toBe(true);
    expect(offers.reenterAtStart).toBe(true);
    expect(offers.beats.map((b) => (b.kind === "cursor" ? [b.to, b.action] : b.kind))).toEqual([
      [VT.SidebarNavOffers, "click"],
      [VT.SidebarNavHome, "click"],
    ]);
    for (const beat of offers.beats) {
      if (beat.kind === "cursor") expect(beat.holdMs).toBeGreaterThan(PAGE_LOAD_MS);
    }
  });

  it("Amenity reservation: Reservations, then View Availability lifts the card top-left with its calendar, then a slot click", () => {
    const scene = homeVisionSequence.find((s) => s.id === "amenity-reservation");
    if (!scene) throw new Error("no amenity-reservation scene");
    expect(scene.keepPage).toBe(true);
    expect(scene.reenterAtStart).toBe(true);
    expect(scene.beats.map((b) => b.kind)).toEqual(["cursor", "cursor", "lift", "cursor", "idle"]);
    const [nav, open, lift, slot] = scene.beats;
    if (nav.kind !== "cursor" || open.kind !== "cursor" || lift.kind !== "lift" || slot.kind !== "cursor") {
      throw new Error("unexpected beats");
    }
    expect(nav.to).toBe(VT.SidebarNavReservations);
    expect(nav.holdMs).toBeGreaterThan(PAGE_LOAD_MS);
    // Scroll to the card and click it; the lift follows without another →.
    expect(open).toMatchObject({ action: "scroll", scrollTo: VT.AmenityCardConference, advanceAfter: true });
    expect(open.then).toEqual([expect.objectContaining({ to: VT.AmenityConferenceViewAvailability, action: "click" })]);
    expect(lift).toMatchObject({ target: VT.AmenityCardConference, position: "top-left" });
    expect(lift.aside).toBeTruthy();
    expect(slot).toMatchObject({ to: VT.AmenityCalendarOpenSlot, action: "hover", reverseTo: VT.BookingModalClose, replayOnBack: true });
    expect(slot.then).toEqual([{ to: VT.AmenityCalendarOpenSlot, action: "click" }]);
  });

  it("Broadcast SMS: the notification arrives by itself, then one beat taps it, types the reply and sends", () => {
    const sms = homeVisionSequence.find((s) => s.id === "broadcast-sms");
    if (!sms) throw new Error("no broadcast-sms scene");
    // A phone scene: the app slides away, and the app underneath follows the app scene.
    expect(sms.stage).toBe("phone");
    expect(sms.appState).toBeUndefined();
    expect(sms.beats.map((b) => b.kind)).toEqual(["idle", "cursor"]);
    const tap = sms.beats[1];
    if (tap.kind !== "cursor") throw new Error("beat 1 is not a cursor beat");
    expect(tap.to).toBe(VT.SmsNotification);
    expect(tap.action).toBe("click");
    expect(tap.then?.map((s) => s.to)).toEqual([VT.SmsInput, VT.SmsSendBtn]);
    expect(tap.then?.map((s) => s.action)).toEqual(["click", "click"]);
    expect(tap.then?.[0].typeText).toBe(SMS_REPLY);
  });

  it("Elections: click Elections, scroll down and back up, switch to Results, no consent modal or tab pill, then click Home", () => {
    const scene = homeVisionSequence.find((s) => s.id === "elections");
    if (!scene) throw new Error("no elections scene");
    // No consent modal, and no floating tab pill, for the whole scene.
    expect(scene.appState).toMatchObject({ phase: "portal", page: "dashboard", electionsConsented: true, hideElectionsTabToggle: true });
    expect(scene.reenterAtStart).toBe(true);
    expect(scene.beats.map((b) => b.kind)).toEqual(["cursor", "cursor"]);
    const [tour, home] = scene.beats;
    if (tour.kind !== "cursor" || home.kind !== "cursor") throw new Error("expected cursor beats");
    // The next → clicks Home and the dashboard loads, instead of a cut to it.
    expect(home).toMatchObject({ to: VT.SidebarNavHome, action: "click" });
    expect(home.holdMs).toBeGreaterThan(PAGE_LOAD_MS);
    expect(tour).toMatchObject({ to: VT.SidebarNavElections, action: "click" });
    expect(tour.holdMs).toBeGreaterThan(PAGE_LOAD_MS);
    // Down to the bottom, a rest, then slowly back up to the top.
    expect(tour.then).toEqual([
      expect.objectContaining({ to: VT.ElectionsPage, action: "scroll" }),
      expect.objectContaining({ to: VT.ElectionsPage, action: "scroll", scrollToTop: true }),
      // Back at the top, the page switches to Results.
      expect.objectContaining({ to: VT.ElectionsPage, action: "signal", signal: ELECTIONS_RESULTS_SIGNAL }),
    ]);
    expect(tour.then?.[0].scrollToTop).toBeUndefined();
  });

  it("Payments keeps the lift + blur up through the modal and releases it on the closing X", () => {
    const payments = homeVisionSequence.find((s) => s.id === "payments");
    const demo = payments?.beats.find((b) => b.kind === "cursor");
    if (demo?.kind !== "cursor") throw new Error("payments has no cursor beat");
    const stops = [{ to: demo.to, releaseStage: demo.releaseStage }, ...(demo.then ?? [])];
    expect(stops.filter((s) => s.releaseStage).map((s) => s.to)).toEqual([VT.PaymentModalCloseBtn]);
    expect(stops[stops.length - 1].to).toBe(VT.PaymentModalCloseBtn);
  });

  it("ARC request follows Payments: Quick Actions -> ARC Request -> fence form, then scrolls the form", () => {
    const ids = homeVisionSequence.map((s) => s.id);
    const payments = ids.indexOf("payments");
    expect(ids.slice(payments, payments + 3)).toEqual(["payments", "arc-request", "ask-hoai"]);
    const arc = homeVisionSequence[payments + 1];
    // One cursor beat, so stepping back from Ask HOAi resets the scene and replays it.
    expect(arc.beats.map((b) => b.kind)).toEqual(["cursor"]);
    const demo = arc.beats[0];
    if (demo.kind !== "cursor") throw new Error("arc-request has no cursor beat");
    const stops = [{ to: demo.to, action: demo.action }, ...(demo.then ?? [])];
    expect(stops.map((s) => [s.to, s.action])).toEqual([
      [VT.QuickActionsBtn, "click"],
      [VT.QuickActionsArcRequestBtn, "click"],
      [VT.ArcFenceFormLink, "click"],
      [VT.ArcFormPage, "scroll"],
    ]);
  });

  it("Ask HOAi drops the fence proposal into the chat, then asks to submit it as an ARC request", () => {
    const askHoai = homeVisionSequence.find((s) => s.id === "ask-hoai");
    const demo = askHoai?.beats[0];
    if (demo?.kind !== "cursor") throw new Error("ask-hoai has no cursor beat");
    expect([demo.to, demo.action, demo.file]).toEqual([VT.AskHoaiDropZone, "drop", "Fence Proposal.pdf"]);
    const [type, send] = demo.then ?? [];
    expect([type?.to, type?.typeText]).toEqual([
      VT.AskHoaiInput,
      "I have this fence proposal. Can you help me submit it as an ARC request?",
    ]);
    expect(send?.to).toBe(VT.AskHoaiSendBtn);
  });

  it("AutoPay starts on the confirm screen Create account lands on (keeps the welcome banner)", () => {
    // Its appState re-mounts the onboarding flow on scene entry; the standalone
    // "autopay" screen has no welcome banner, so it would vanish mid-demo.
    const autopay = homeVisionSequence.find((s) => s.id === "autopay");
    expect(autopay?.appState).toEqual({ phase: "onboarding", onboardingScreen: "confirm" });
  });

  it("every scene has at least one beat", () => {
    for (const scene of homeVisionSequence) {
      expect(scene.beats.length).toBeGreaterThan(0);
    }
  });

  it("VT constants are unique", () => {
    const values = Object.values(VT);
    expect(new Set(values).size).toBe(values.length);
  });
});
