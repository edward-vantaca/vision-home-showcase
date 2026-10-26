import { useState } from "react";
import { createPortal } from "react-dom";
import { VT } from "../viewTransitionNames";

// The amenity's week calendar (Sun 25 – Sat 31 October 2026, today Mon 26),
// 9 AM – 5 PM. Clicking an open hour opens the Book Reservation modal for it.

const DAYS = [
  { short: "SUN", date: 25 },
  { short: "MON", date: 26 },
  { short: "TUE", date: 27 },
  { short: "WED", date: 28 },
  { short: "THU", date: 29 },
  { short: "FRI", date: 30 },
  { short: "SAT", date: 31 },
] as const;
const TODAY = 1;
const FIRST_HOUR = 9;
const LAST_HOUR = 17;
const HOURS = Array.from({ length: LAST_HOUR - FIRST_HOUR }, (_, i) => FIRST_HOUR + i);
/** Mon 26 is greyed out up to "now". */
const NOW_HOUR = 14.75;
/** Fractional hours [start, end) already held on a day. */
// Clear of Tue 27 1–3 PM, the slot the walkthrough books.
const RESERVATIONS: ReadonlyArray<{ day: number; start: number; end: number }> = [
  { day: 2, start: 10, end: 11 },
  { day: 3, start: 9, end: 12 },
  { day: 3, start: 15, end: 16 },
  { day: 4, start: 11, end: 15 },
  { day: 5, start: 13, end: 14 },
  { day: 6, start: 10, end: 11 },
];
/** The open hour the walkthrough clicks: Tue 27, 1 PM. */
const DEMO_SLOT = { day: 2, hour: 13 };
const BOOKING_HOURS = 2;

const dmSans = { fontVariationSettings: '"opsz" 14' };

/** A span of hours as a share of the grid's height. */
const pct = (hours: number) => `${(hours / HOURS.length) * 100}%`;

function hourLabel(hour: number): string {
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return `${h} ${hour < 12 ? "AM" : "PM"}`;
}

function timeLabel(hour: number): string {
  const h = Math.floor(hour) % 12 === 0 ? 12 : Math.floor(hour) % 12;
  const m = Math.round((hour % 1) * 60);
  // No-break space, so "12:00 PM" never splits across lines.
  return `${h}:${String(m).padStart(2, "0")}\u00a0${hour < 12 ? "AM" : "PM"}`;
}

function isPast(day: number, hour: number): boolean {
  return day < TODAY || (day === TODAY && hour < NOW_HOUR);
}

function isOpen(day: number, hour: number): boolean {
  if (isPast(day, hour)) return false;
  return !RESERVATIONS.some((r) => r.day === day && hour + 1 > r.start && hour < r.end);
}

function Chevron({ className = "" }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function OutlinedField({ label, value, width }: { label: string; value: string; width: number }) {
  return (
    <div className="relative flex h-[44px] items-center justify-between rounded-[6px] border border-[#cfd3da] px-[14px] text-[15px] text-[#262630]" style={{ width }}>
      <span className="absolute -top-[9px] left-[10px] bg-white px-[4px] text-[12px] text-[#5a5a66]">{label}</span>
      <span style={dmSans}>{value}</span>
      <Chevron className="text-[#5a5a66]" />
    </div>
  );
}

export function AmenityBookingStage({ amenity }: { amenity: string }) {
  const [booking, setBooking] = useState<{ day: number; hour: number } | null>(null);
  const [hovered, setHovered] = useState<{ day: number; hour: number } | null>(null);

  return (
    <div data-ux-id="amenity-calendar" className="flex h-full flex-col rounded-[16px] border border-[#d9dde3] bg-white px-[24px] pb-[20px] pt-[22px]">
      {/* Toolbar */}
      <div className="flex items-center gap-[18px]">
        <span className="rounded-[6px] border border-[#cfd3da] px-[16px] py-[8px] text-[15px] text-[#262630]" style={dmSans}>Today</span>
        <span className="text-[#9aa0a9]">
          <Chevron className="rotate-90" />
        </span>
        <span className="text-[#262630]">
          <Chevron className="-rotate-90" />
        </span>
        <p className="font-['DM_Sans:Regular',sans-serif] text-[26px] text-[#262630]" style={dmSans}>October 2026</p>
        <div className="ml-auto flex gap-[14px]">
          <OutlinedField label="View" value="Week" width={120} />
          <OutlinedField label="Date" value="10/26/2026" width={190} />
        </div>
      </div>

      {/* Day headers */}
      <div className="mt-[18px] grid grid-cols-[64px_repeat(7,1fr)] border-b border-[#e5e7eb] pb-[10px]">
        <span />
        {DAYS.map((d, i) => (
          <div key={d.date} className="flex flex-col items-center gap-[4px]">
            <span className={`text-[12px] font-semibold tracking-wide ${i === TODAY ? "text-[#4a7fe8]" : "text-[#5a5a66]"}`}>{d.short}</span>
            <span
              className={`flex size-[40px] items-center justify-center rounded-full text-[22px] ${
                i === TODAY ? "bg-[#4a7fe8] text-white" : "text-[#5a5a66]"
              }`}
              style={dmSans}
            >
              {d.date}
            </span>
          </div>
        ))}
      </div>

      {/* Hours grid: fills the panel's height, one equal row per hour */}
      <div className="relative mt-[12px] mb-[8px] grid min-h-[360px] flex-1 grid-cols-[64px_repeat(7,1fr)]">
        <div className="relative">
          {[...HOURS, LAST_HOUR].map((h, i) => (
            <span key={h} className="absolute left-0 -translate-y-1/2 text-[12px] text-[#5a5a66]" style={{ top: pct(i) }}>
              {hourLabel(h)}
            </span>
          ))}
        </div>
        {DAYS.map((d, day) => (
          <div key={d.date} className="relative border-l border-[#e5e7eb]">
            {/* Past time, greyed out */}
            {day <= TODAY && (
              <div
                className="absolute inset-x-0 top-0 bg-[#f2f3f5]"
                style={{ height: pct(Math.min(day < TODAY ? LAST_HOUR : NOW_HOUR, LAST_HOUR) - FIRST_HOUR) }}
              />
            )}
            {HOURS.map((h, i) => {
              const open = isOpen(day, h);
              const demo = day === DEMO_SLOT.day && h === DEMO_SLOT.hour;
              const isHovered = hovered?.day === day && hovered.hour === h;
              return open ? (
                <button
                  key={h}
                  type="button"
                  aria-label={`Book ${d.short} ${d.date}, ${hourLabel(h)}`}
                  data-ux-id={`amenity-calendar-slot-${d.date}-${h}`}
                  data-vt-name={demo ? VT.AmenityCalendarOpenSlot : undefined}
                  onClick={() => {
                    setHovered(null);
                    setBooking({ day, hour: h });
                  }}
                  onMouseEnter={() => setHovered({ day, hour: h })}
                  onMouseLeave={() => setHovered((cur) => (cur?.day === day && cur.hour === h ? null : cur))}
                  className="absolute inset-x-0 border-t border-[#e5e7eb] p-[3px] text-left"
                  style={{ top: pct(i), height: pct(1) }}
                >
                  {/* The one-hour block under the pointer */}
                  <span
                    data-ux-id={isHovered ? "amenity-calendar-hover-slot" : undefined}
                    className={`flex h-full flex-col justify-center rounded-[4px] border-[1.5px] border-[#4a7fe8] bg-[#eef5fe] px-[8px] transition-opacity duration-150 ${
                      isHovered ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <span className="font-['DM_Sans:SemiBold',sans-serif] text-[12px] font-semibold leading-tight text-[#2f5bea]" style={dmSans}>
                      {timeLabel(h)} – {timeLabel(h + 1)}
                    </span>
                    <span className="text-[11px] leading-tight text-[#2f5bea]">Available</span>
                  </span>
                </button>
              ) : (
                <div key={h} className="absolute inset-x-0 border-t border-[#e5e7eb]" style={{ top: pct(i), height: pct(1) }} />
              );
            })}
            {RESERVATIONS.filter((r) => r.day === day).map((r) => (
              <div
                key={r.start}
                className="absolute inset-x-[2px] rounded-[3px] border-l-[4px] border-[#4a7fe8] bg-[#e7dcfb] px-[8px] py-[6px]"
                style={{ top: pct(r.start - FIRST_HOUR), height: pct(r.end - r.start) }}
              >
                <p className="font-['DM_Sans:SemiBold',sans-serif] text-[13px] font-semibold leading-tight text-[#1c1a4f]" style={dmSans}>
                  Tentative Reservation
                </p>
                <p className="mt-[3px] text-[12px] leading-tight text-[#1c1a4f]" style={dmSans}>
                  {timeLabel(r.start)} – {timeLabel(r.end)}
                </p>
              </div>
            ))}
          </div>
        ))}
      </div>

      {booking && (
        <BookReservationModal
          amenity={amenity}
          date={`10/${DAYS[booking.day].date}/2026`}
          start={booking.hour}
          end={Math.min(booking.hour + BOOKING_HOURS, LAST_HOUR)}
          onClose={() => setBooking(null)}
        />
      )}
    </div>
  );
}

function BookReservationModal({
  amenity,
  date,
  start,
  end,
  onClose,
}: {
  amenity: string;
  date: string;
  start: number;
  end: number;
  onClose: () => void;
}) {
  const [startTime, setStartTime] = useState(start);
  const [endTime, setEndTime] = useState(end);
  const options = Array.from({ length: (LAST_HOUR - FIRST_HOUR) * 2 + 1 }, (_, i) => FIRST_HOUR + i / 2);
  const label = "mb-[8px] font-['DM_Sans:SemiBold',sans-serif] text-[15px] font-semibold text-[#262630]";
  const select =
    "h-[48px] w-full appearance-none rounded-[8px] border border-[#cfd3da] bg-white px-[16px] text-[15px] text-[#262630] outline-none";

  // Portaled to <body>, above the lifted card (z 260) and below the cursor (z 400).
  return createPortal(
    <div
      data-ux-id="book-reservation-modal"
      className="fixed inset-0 z-[300] flex items-center justify-center bg-[#1c2030]/45 p-[16px] [pointer-events:auto]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div role="dialog" aria-label={`${amenity}: book reservation`} className="flex max-h-[calc(100vh-32px)] w-full max-w-[540px] flex-col overflow-hidden rounded-[14px] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.25)]">
        <div className="flex items-center justify-between border-b border-[#e5e7eb] px-[24px] py-[18px]">
          <p className="font-['DM_Sans:Bold',sans-serif] text-[22px] font-bold text-[#262630]" style={dmSans}>{amenity}</p>
          <button type="button" aria-label="Close" data-vt-name={VT.BookingModalClose} onClick={onClose} className="text-[#262630]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-[18px] overflow-y-auto px-[24px] py-[22px]">
          <p className="text-[13px] font-semibold uppercase tracking-wide text-[#5a5a66]">Book Reservation</p>
          <div>
            <p className={label} style={dmSans}>Select Date</p>
            <div className="flex h-[44px] items-center justify-between rounded-[8px] border border-[#cfd3da] bg-[#fafafa] px-[14px] text-[15px] text-[#5a5a66]">
              <span>{date}</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#262630" aria-hidden>
                <path d="M7 2h2v2h6V2h2v2h3a1 1 0 011 1v15a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1h3V2zm12 7H5v10h14V9zM7 11h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zm-8 4h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z" />
              </svg>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-[16px]">
            {(
              [
                ["Start Time", startTime, setStartTime, "booking-start-time"],
                ["End Time", endTime, setEndTime, "booking-end-time"],
              ] as const
            ).map(([name, value, set, uxId]) => (
              <label key={name} className="block">
                <p className={label} style={dmSans}>{name}</p>
                <span className="relative block">
                  <select data-ux-id={uxId} value={value} onChange={(e) => set(Number(e.target.value))} className={select}>
                    {options.map((o) => (
                      <option key={o} value={o}>{timeLabel(o)}</option>
                    ))}
                  </select>
                  <Chevron className="pointer-events-none absolute right-[14px] top-1/2 -translate-y-1/2 text-[#5a5a66]" />
                </span>
              </label>
            ))}
          </div>
          <label className="block">
            <p className={label} style={dmSans}>Event Details</p>
            <textarea rows={4} className="w-full resize-none rounded-[8px] border border-[#cfd3da] px-[14px] py-[10px] text-[15px] outline-none" />
          </label>
          <div>
            <p className={label} style={dmSans}>Attachments &amp; Documents</p>
            <div className="flex items-center justify-center gap-[28px] rounded-[8px] border border-[#e1e4e8] py-[30px]">
              <svg width="26" height="30" viewBox="0 0 24 28" fill="none" aria-hidden>
                <path d="M14 1H5a3 3 0 00-3 3v20a3 3 0 003 3h14a3 3 0 003-3V9l-8-8z" stroke="#5a5a66" strokeWidth="2" strokeLinejoin="round" />
                <path d="M12 21v-8m0 0l-3.5 3.5M12 13l3.5 3.5" stroke="#5a5a66" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div>
                <p className="font-['DM_Sans:SemiBold',sans-serif] text-[17px] font-semibold text-[#4b5260]" style={dmSans}>Select file(s) to upload</p>
                <p className="text-[14px] text-[#4b5260]">Maximum upload limit 25MB</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end border-t border-[#e5e7eb] px-[24px] py-[16px]">
          <button type="button" onClick={onClose} className="rounded-[8px] bg-[#2f5bea] px-[26px] py-[12px] font-['DM_Sans:SemiBold',sans-serif] text-[16px] font-semibold text-white hover:bg-[#2550d8]" style={dmSans}>
            Book Reservation
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
