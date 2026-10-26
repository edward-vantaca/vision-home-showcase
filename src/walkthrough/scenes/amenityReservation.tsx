import type { Scene } from "../types";
import { VT } from "../viewTransitionNames";
import { PAGE_LOAD_MS } from "../../pageLoad";
import { AmenityBookingStage } from "../stage-content/AmenityBookingStage";

// Starts from whatever page the portal shows (keepPage). → clicks Reservations
// and the page loads. → scrolls to the Conference Room card and clicks View
// Availability: the card lifts to the top-left and its week calendar fades in
// beside it. → clicks an open slot (Tue 27, 1 PM) and the Book Reservation
// modal opens. → closes it all and the card settles back into the page.
export const amenityReservationScene: Scene = {
  id: "amenity-reservation",
  label: "Amenity reservation",
  page: "dashboard",
  appState: { phase: "portal", page: "dashboard", dashboardView: "homeowner", askHoaiOpen: true, balancePaid: true },
  keepPage: true,
  reenterAtStart: true,
  beats: [
    { kind: "cursor", to: VT.SidebarNavReservations, action: "click", durationMs: 1200, holdMs: PAGE_LOAD_MS + 500 },
    {
      // The click's effect is the next beat: the card lifts straight away.
      kind: "cursor",
      to: VT.ReservationsPage,
      action: "scroll",
      scrollTo: VT.AmenityCardConference,
      scrollMs: 2500,
      then: [{ to: VT.AmenityConferenceViewAvailability, action: "click", holdMs: 300 }],
      advanceAfter: true,
    },
    {
      kind: "lift",
      target: VT.AmenityCardConference,
      scale: 1.25,
      position: "top-left",
      aside: <AmenityBookingStage amenity="Conference Room" />,
    },
    {
      // The lift and calendar stay on stage while the cursor picks a slot.
      kind: "cursor",
      to: VT.AmenityCalendarOpenSlot,
      action: "click",
      durationMs: 1500,
      reverseTo: VT.BookingModalClose,
      replayOnBack: true,
    },
    { kind: "idle" },
  ],
};
