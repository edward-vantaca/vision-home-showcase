type Props = { actionId: string };

export function BoardActionStageDetail({ actionId }: Props) {
  return (
    <div className="h-full flex flex-col p-10 gap-6">
      <div className="flex items-baseline gap-4">
        <span className="text-[12px] uppercase tracking-[0.5px] text-[#4b5563] font-['DM_Sans:SemiBold',sans-serif] font-semibold">
          Violation
        </span>
        <span className="text-[24px] text-[#262630] font-['DM_Sans:Regular',sans-serif]">
          {actionId}
        </span>
      </div>
      <p className="text-[32px] text-[#262630] font-['DM_Sans:SemiBold',sans-serif] font-semibold leading-tight">
        Overgrown Landscaping
      </p>
      <p className="text-[16px] text-[#4b5563]">
        19 Birch Way, Rose City, VA 23232 &middot; Account HGWL31333
      </p>

      <div
        data-ux-id="stage-detail-timeline"
        className="mt-4 border border-[#e1e9ef] rounded-xl p-6 flex flex-col gap-4"
      >
        <p className="text-[14px] uppercase tracking-[0.5px] text-[#4b5563] font-['DM_Sans:SemiBold',sans-serif] font-semibold">
          Timeline
        </p>
        <ul className="flex flex-col gap-3 text-[15px] text-[#262630]">
          <li>Initial inspection — 2026-09-14</li>
          <li>First notice sent — 2026-09-16</li>
          <li>Owner response window closed — 2026-09-30</li>
          <li>Second inspection confirmed no remediation — 2026-10-05</li>
        </ul>
      </div>

      <div className="mt-auto flex gap-4">
        <button
          data-ux-id="stage-vote-approve"
          className="flex-1 px-6 py-4 rounded-xl bg-[#1b8c5a] text-white text-[16px] font-['DM_Sans:SemiBold',sans-serif] font-semibold hover:bg-[#157149]"
        >
          Approve Fine
        </button>
        <button
          data-ux-id="stage-vote-reject"
          className="flex-1 px-6 py-4 rounded-xl bg-white border border-[#e1e9ef] text-[#262630] text-[16px] font-['DM_Sans:SemiBold',sans-serif] font-semibold hover:bg-[#f6f8fb]"
        >
          Reject
        </button>
      </div>
    </div>
  );
}
