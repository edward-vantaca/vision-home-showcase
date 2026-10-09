import type { Sequence } from "../types";
import { AmenityReservationStage } from "../stage-content/AmenityReservationStage";

export const amenitySequence: Sequence = {
  id: "amenity",
  title: "Amenity Reservation",
  beats: [
    { kind: "navigate", to: "amenities" },
    {
      kind: "highlight",
      target: "amenity-tile-pool",
      caption: "Four amenities. Big photos. One tap each.",
    },
    {
      kind: "lift",
      target: "amenity-tile-pool",
      scale: 1.6,
      position: "center",
    },
    {
      kind: "expand",
      content: <AmenityReservationStage amenityId="pool" />,
      caption:
        "Pick a day. Pick a time. The amenity knows the household rules — pool caps at 6 guests on weekends.",
    },
    {
      kind: "annotate",
      tracks: [
        { type: "pulse", target: "reservation-slot-sat-2pm", count: 3 },
        { type: "arrow", from: "stage-guest-badge", to: "reservation-slot-sat-2pm" },
        { type: "typeCaption", text: "The slot already knows: 6 guests max this weekend." },
      ],
    },
    {
      kind: "return",
      caption: "Reserved. Confirmation hits the resident app and the gate code.",
    },
  ],
};
