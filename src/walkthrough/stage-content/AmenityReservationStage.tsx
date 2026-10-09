type Props = { amenityId: string };

const timeSlots = [
  { id: "fri-10am", day: "Fri", time: "10:00 AM", status: "available" as const },
  { id: "fri-2pm", day: "Fri", time: "2:00 PM", status: "available" as const },
  { id: "sat-10am", day: "Sat", time: "10:00 AM", status: "booked" as const },
  { id: "sat-2pm", day: "Sat", time: "2:00 PM", status: "available" as const },
  { id: "sun-10am", day: "Sun", time: "10:00 AM", status: "available" as const },
  { id: "sun-2pm", day: "Sun", time: "2:00 PM", status: "booked" as const },
];

export function AmenityReservationStage({ amenityId }: Props) {
  const image = `/assets/community-${amenityId}.jpg`;
  return (
    <div className="h-full flex">
      <div className="flex-1 relative">
        <img src={image} alt="" className="w-full h-full object-cover" />
        <div
          data-ux-id="stage-guest-badge"
          className="absolute top-6 left-6 px-4 py-2 bg-white/95 rounded-full text-[14px] font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630]"
        >
          6 guests max this weekend
        </div>
      </div>
      <div className="w-[420px] flex flex-col gap-5 p-8 bg-white">
        <p className="text-[24px] font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630]">
          Reserve the Pool
        </p>
        <p className="text-[14px] text-[#4b5563]">Pick a day. Pick a time. We handle the rest.</p>
        <div className="flex flex-col gap-2 mt-2">
          {timeSlots.map((s) => (
            <button
              key={s.id}
              data-ux-id={`reservation-slot-${s.id}`}
              disabled={s.status === "booked"}
              className={`flex items-center justify-between px-4 py-3 rounded-lg border text-[14px] ${
                s.status === "booked"
                  ? "border-[#e1e9ef] bg-[#f6f8fb] text-[#9ca3af] cursor-not-allowed"
                  : "border-[#e1e9ef] bg-white text-[#262630] hover:border-[#247ae4] cursor-pointer"
              }`}
            >
              <span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold">{s.day}</span>
              <span>{s.time}</span>
              <span
                className={`text-[12px] ${s.status === "booked" ? "text-[#9ca3af]" : "text-[#1b8c5a]"}`}
              >
                {s.status === "booked" ? "Booked" : "Available"}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
