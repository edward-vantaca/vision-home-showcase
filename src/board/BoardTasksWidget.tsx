import { useState } from "react";
import { createPortal } from "react-dom";
import {
  ChevronLeft, ChevronRight, ArrowRight, Check, X,
  Ruler, FileText, Wrench, Search, Paperclip, Coins, ShieldAlert, Send,
} from "lucide-react";

// ─── Types & Data ─────────────────────────────────────────────────────────────

type FilterKey = "my" | "arc" | "invoices" | "work-orders" | "collections" | "inspections" | "violations";

interface BoardTask {
  id: string;
  typeLabel: string;
  title: string;
  description: string;
  address: string;
  accountNumber: string;
  amount?: string;
  date?: string;
  glAccount?: string;
  fund?: string;
}

const tasksByFilter: Record<FilterKey, BoardTask[]> = {
  arc: [
    { id: "XN 128377", typeLabel: "ARC. REQUEST", title: "Fence Replacement Request", description: "Replace existing 4ft wood fence with 6ft vinyl privacy fence along rear property line.", address: "227 Silver Creek, Unit 120, Rose City, VA 23232", accountNumber: "HGWL31318" },
    { id: "XN 128378", typeLabel: "ARC. REQUEST", title: "Deck Addition", description: "Addition of a 12x16 cedar deck to the rear of the property with perimeter railing.", address: "412 Maple Court, Unit 8, Rose City, VA 23232", accountNumber: "HGWL31319" },
    { id: "XN 128379", typeLabel: "ARC. REQUEST", title: "Exterior Paint", description: "Repainting exterior of home from beige to light gray. HOA approved color palette variant #3.", address: "88 Oak Lane, Rose City, VA 23232", accountNumber: "HGWL31320" },
  ],
  invoices: [
    { id: "XN 324157", typeLabel: "INVOICE", title: "Green Lawn Co.", description: "Landscaping services — June maintenance", address: "Common Areas — Madison Green", accountNumber: "4292026113", amount: "$3,200", date: "8/06/2026", glAccount: "2001 Operating Expenses", fund: "Operating" },
    { id: "INV-10043", typeLabel: "INVOICE", title: "AquaClean Services", description: "Pool chemical treatment and filter cleaning", address: "Community Pool — 1 Madison Green Dr", accountNumber: "4292026114", amount: "$5,300", date: "8/06/2026", glAccount: "2002 Retained Earning", fund: "Operating" },
  ],
  "work-orders": [
    { id: "WO-2201", typeLabel: "WORK ORDER", title: "HVAC Unit Repair", description: "Clubhouse HVAC unit producing excessive noise. Requires inspection and likely compressor replacement.", address: "Clubhouse — 1 Madison Green Dr", accountNumber: "WO31318" },
  ],
  collections: [
    { id: "COL-0091", typeLabel: "COLLECTION", title: "Delinquent Assessment", description: "Homeowner is 90+ days past due on monthly assessments. Sent to collections per board policy.", address: "88 Oak Lane, Rose City, VA 23232", accountNumber: "HGWL31325" },
  ],
  inspections: [
    { id: "INS-0441", typeLabel: "INSPECTION", title: "Annual Property Inspection", description: "Routine annual inspection of all common areas, building exteriors, and shared amenities.", address: "All Common Areas — Madison Green", accountNumber: "INS31318" },
  ],
  violations: [
    { id: "VIO-1801", typeLabel: "VIOLATION", title: "Unapproved Fence Install", description: "Homeowner installed a 6ft wood fence without ARC approval. Requires removal or retroactive submission.", address: "227 Silver Creek, Unit 120, Rose City, VA 23232", accountNumber: "HGWL31330" },
    { id: "VIO-1802", typeLabel: "VIOLATION", title: "Trash Bins Left Out", description: "Trash and recycling bins left at curb for more than 24 hours after scheduled pickup.", address: "412 Maple Court, Unit 8, Rose City, VA 23232", accountNumber: "HGWL31331" },
    { id: "VIO-1803", typeLabel: "VIOLATION", title: "Parking Violation", description: "Vehicle parked in fire lane for extended period. Second notice issued.", address: "88 Oak Lane, Rose City, VA 23232", accountNumber: "HGWL31332" },
    { id: "VIO-1804", typeLabel: "VIOLATION", title: "Overgrown Landscaping", description: "Front lawn grass exceeds HOA height limit. Owner notified, no action taken within 14-day window.", address: "19 Birch Way, Rose City, VA 23232", accountNumber: "HGWL31333" },
    { id: "VIO-1805", typeLabel: "VIOLATION", title: "Exterior Decoration Violation", description: "Holiday decorations left up past the permitted seasonal window per community guidelines.", address: "55 Cedar Blvd, Rose City, VA 23232", accountNumber: "HGWL31334" },
  ],
  my: [],
};

tasksByFilter.my = [
  ...tasksByFilter.arc.slice(0, 3),
  ...tasksByFilter.invoices.slice(0, 2),
  ...tasksByFilter["work-orders"].slice(0, 1),
  ...tasksByFilter.collections.slice(0, 1),
  ...tasksByFilter.inspections.slice(0, 1),
  ...tasksByFilter.violations.slice(0, 5),
];

const chipConfig: { key: FilterKey; label: string; Icon?: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { key: "my", label: "All Items" },
  { key: "arc", label: "ARC", Icon: Ruler },
  { key: "invoices", label: "Invoices", Icon: FileText },
  { key: "work-orders", label: "Work Orders", Icon: Wrench },
  { key: "collections", label: "Collections", Icon: Coins },
  { key: "inspections", label: "Inspections", Icon: Search },
  { key: "violations", label: "Violations", Icon: ShieldAlert },
];

const filterCounts: Record<FilterKey, number> = Object.fromEntries(
  Object.entries(tasksByFilter).map(([k, v]) => [k, v.length])
) as Record<FilterKey, number>;

// ─── Detail row helper ────────────────────────────────────────────────────────

function DetailRow({ label, value, multiLine = false }: { label: string; value: string; multiLine?: boolean }) {
  return (
    <div className={`flex gap-[4px] w-full text-[#262630] text-[14px] ${multiLine ? "items-start" : "items-center"}`}>
      <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold leading-[1.2] shrink-0 w-[155px]" style={{ fontVariationSettings: '"opsz" 14' }}>{label}</p>
      <p className={`font-['DM_Sans:Regular',sans-serif] font-normal ${multiLine ? "leading-[1.3] flex-1 min-w-px" : "whitespace-nowrap"}`} style={{ fontVariationSettings: '"opsz" 14' }}>{value}</p>
    </div>
  );
}

// ─── Widget ───────────────────────────────────────────────────────────────────

export default function BoardTasksWidget() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>("my");
  const [taskIndex, setTaskIndex] = useState(0);
  const [decisions, setDecisions] = useState<Record<string, "approved" | "declined">>({});
  const [detailTask, setDetailTask] = useState<BoardTask | null>(null);
  const [detailTab, setDetailTab] = useState<"messages" | "ledger" | "recent">("messages");
  const [pillsExpanded, setPillsExpanded] = useState(false);

  const tasks = tasksByFilter[activeFilter];
  const total = tasks.length;
  const task = tasks[taskIndex] ?? null;
  const decision = task ? decisions[task.id] : undefined;
  const allDecided = total > 0 && tasks.every(t => decisions[t.id]);

  const handleFilter = (key: FilterKey) => {
    setActiveFilter(key);
    setTaskIndex(0);
  };

  const handleDecide = (verdict: "approved" | "declined") => {
    if (!task) return;
    setDecisions(prev => ({ ...prev, [task.id]: verdict }));
  };

  return (
    <div data-ux-id="board-tasks-widget" className="bg-white drop-shadow-[0px_2px_9px_rgba(18,17,48,0.07)] flex flex-col gap-[24px] items-start px-[16px] md:px-[26px] py-[20px] md:py-[24px] relative rounded-[18px] shrink-0 w-full">

      {/* Header */}
      <div className="flex gap-[14px] items-center relative shrink-0 w-full">
        <div className="flex flex-[1_0_0] flex-col gap-[2px] items-start min-w-px">
          <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold leading-normal text-[#262630] text-[20px]" style={{ fontVariationSettings: '"opsz" 14' }}>Board Actions</p>
        </div>
        <div className="flex gap-[7px] items-center text-[#0d5bba] text-[14px] whitespace-nowrap cursor-pointer">
          <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold" style={{ fontVariationSettings: '"opsz" 14' }}>View All</p>
          <ArrowRight size={14} />
        </div>
      </div>

      {/* Filter chips + task card */}
      <div className="flex flex-col gap-[16px] items-start relative shrink-0 w-full">

        {/* Filter chips */}
        <div className="flex flex-col gap-[8px] w-full">
          <div className={`flex flex-wrap sm:flex-nowrap gap-[9px] items-center w-full sm:overflow-x-auto sm:pb-[2px] overflow-hidden transition-[max-height] duration-300 ease-in-out ${pillsExpanded ? "max-h-[300px]" : "max-h-[90px] sm:max-h-none"}`}>
            {chipConfig.map(({ key, label, Icon }) => {
              const selected = activeFilter === key;
              const count = filterCounts[key];
              return (
                <button
                  key={key}
                  onClick={() => handleFilter(key)}
                  className={`flex gap-[8px] items-center pl-[15px] pr-[7px] py-[8px] rounded-[50px] shrink-0 cursor-pointer transition-colors ${selected ? "bg-[#247ae4]" : "bg-[#dfeaf0] hover:bg-[#cddce6]"}`}
                >
                  {Icon && <Icon size={13} className={`shrink-0 hidden sm:block ${selected ? "text-white" : "text-[#4b5563]"}`} />}
                  <p className={`font-['DM_Sans:SemiBold',sans-serif] font-semibold leading-normal shrink-0 text-[14px] whitespace-nowrap ${selected ? "text-white" : "text-[#262630]"}`} style={{ fontVariationSettings: '"opsz" 14' }}>
                    {label}
                  </p>
                  <div className={`flex flex-col items-center justify-center rounded-[50px] shrink-0 size-[19px] ${selected ? "bg-[rgba(255,255,255,0.3)]" : "bg-white"}`}>
                    <p className={`font-['DM_Sans:SemiBold',sans-serif] font-semibold leading-normal shrink-0 text-[13px] text-center whitespace-nowrap ${selected ? "text-white" : "text-[#262630]"}`} style={{ fontVariationSettings: '"opsz" 14' }}>
                      {count}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setPillsExpanded(p => !p)}
            className="sm:hidden self-start text-[#247ae4] text-[13px] font-['DM_Sans:SemiBold',sans-serif] font-semibold cursor-pointer hover:underline"
            style={{ fontVariationSettings: '"opsz" 14' }}
          >
            {pillsExpanded ? "Show less ↑" : "Show more ↓"}
          </button>
        </div>

        {/* Counter + task card */}
        <div className="flex flex-col gap-[8px] items-start relative shrink-0 w-full">

          {!allDecided && (
            <div className="flex items-center justify-start gap-[24px] relative shrink-0 w-full">
              <p className="font-['DM_Sans:Regular',sans-serif] font-normal leading-[1.5] text-[#4b5563] text-[13px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>
                Reviewing {taskIndex + 1} of {total}
              </p>
              <div className="flex gap-[4px] items-center shrink-0">
                <button
                  onClick={() => setTaskIndex(i => Math.max(0, i - 1))}
                  disabled={taskIndex === 0}
                  className="size-[28px] flex items-center justify-center rounded-full border border-[#e1e9ef] bg-white hover:bg-[#f3f4f6] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  <ChevronLeft size={13} className="text-[#4b5563]" />
                </button>
                <button
                  onClick={() => setTaskIndex(i => Math.min(total - 1, i + 1))}
                  disabled={taskIndex >= total - 1}
                  className="size-[28px] flex items-center justify-center rounded-full border border-[#e1e9ef] bg-white hover:bg-[#f3f4f6] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  <ChevronRight size={13} className="text-[#4b5563]" />
                </button>
              </div>
            </div>
          )}

          {allDecided ? (
            <div className="bg-white border border-[#e1e9ef] flex flex-col items-center justify-center gap-[16px] px-[32px] py-[40px] rounded-[16px] shrink-0 w-full">
              <div className="flex items-center justify-center size-[64px] rounded-full bg-[#f0faf2] shrink-0">
                <Check size={28} className="text-[#4a9237]" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col items-center gap-[6px]">
                <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[18px] text-[#262630]" style={{ fontVariationSettings: '"opsz" 14' }}>{"You're all caught up!"}</p>
                <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[14px] text-[#6b7280]" style={{ fontVariationSettings: '"opsz" 14' }}>No items need your review right now.</p>
              </div>
            </div>
          ) : task && (
            <div
              data-ux-id="board-task-current"
              className="bg-white border border-[#e1e9ef] flex flex-col sm:flex-row sm:items-center gap-[16px] sm:gap-[23px] px-[20px] sm:px-[32px] py-[16px] sm:py-[18px] rounded-[16px] shrink-0 w-full"
            >

              {/* Left: label + id */}
              <div className="flex flex-col gap-[6px] items-start sm:w-[150px] sm:shrink-0 min-w-0">
                <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold leading-[1.5] text-[#4b5563] text-[12px] uppercase tracking-[0.5px]" style={{ fontVariationSettings: '"opsz" 14' }}>
                  {task.amount ? `Invoice # ${task.accountNumber}` : task.typeLabel}
                </p>
                <p className="font-['DM_Sans:Regular',sans-serif] font-normal leading-[1.2] text-[#262630] text-[22px] sm:text-[24px] break-words" style={{ fontVariationSettings: '"opsz" 14' }}>
                  {task.id}
                </p>
                <button className="flex gap-[6px] items-center text-[#247ae4] text-[12px] cursor-pointer hover:underline">
                  <span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold leading-[1.5]" style={{ fontVariationSettings: '"opsz" 14' }}>View Attachments</span>
                  <Paperclip size={11} />
                </button>
              </div>

              <div className="hidden sm:block self-stretch w-px bg-[#e1e9ef] shrink-0" />
              <div className="block sm:hidden w-full h-px bg-[#e1e9ef]" />

              {/* Middle: details */}
              <div className="flex flex-[1_0_0] flex-col gap-[6px] items-start min-w-0 w-full">
                {task.amount ? (
                  <>
                    <p className="font-['DM_Sans:Regular',sans-serif] font-normal leading-[1.5] text-[#4b5563] text-[10px]" style={{ fontVariationSettings: '"opsz" 14' }}>{task.date}</p>
                    <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold leading-[1.5] text-[#262630] text-[13px]" style={{ fontVariationSettings: '"opsz" 14' }}>{task.title}</p>
                    <p className="font-['DM_Sans:Regular',sans-serif] font-normal leading-[1.5] text-[#262630] text-[12px]" style={{ fontVariationSettings: '"opsz" 14' }}>{task.description}</p>
                    <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold leading-[1.5] text-[#262630] text-[12px]" style={{ fontVariationSettings: '"opsz" 14' }}>Total: {task.amount}</p>
                    <p className="font-['DM_Sans:Regular',sans-serif] font-normal leading-[1.5] text-[#4b5563] text-[11px]" style={{ fontVariationSettings: '"opsz" 14' }}>GL Account: {task.glAccount}</p>
                  </>
                ) : (
                  <>
                    <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold leading-[1.5] text-[#262630] text-[13px]" style={{ fontVariationSettings: '"opsz" 14' }}>{task.title}</p>
                    <p className="font-['DM_Sans:Regular',sans-serif] font-normal leading-[1.5] text-[#262630] text-[12px]" style={{ fontVariationSettings: '"opsz" 14' }}>{task.description}</p>
                    <p className="font-['DM_Sans:Regular',sans-serif] font-normal leading-[1.5] text-[#4b5563] text-[11px]" style={{ fontVariationSettings: '"opsz" 14' }}>{task.address}</p>
                    <p className="font-['DM_Sans:Regular',sans-serif] font-normal leading-[1.5] text-[#4b5563] text-[11px]" style={{ fontVariationSettings: '"opsz" 14' }}>Account Number: {task.accountNumber}</p>
                  </>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); setDetailTask(task); setDetailTab("messages"); }}
                  className="mt-[2px] flex items-center justify-center gap-[5px] px-[10px] py-[4px] rounded-[6px] border border-[#d1d5db] text-[#374151] text-[12px] font-['DM_Sans:SemiBold',sans-serif] font-semibold bg-white hover:bg-[#f9fafb] cursor-pointer transition-colors w-full sm:w-auto"
                  style={{ fontVariationSettings: '"opsz" 14' }}
                >
                  View Details
                </button>

                {/* Mobile approve/decline */}
                <div className="flex sm:hidden gap-[8px] w-full mt-[2px]">
                  {decision === "approved" ? (
                    <div className="flex-1 bg-[#3a7a2c] border border-[#428230] flex gap-[6px] items-center justify-center px-[12px] py-[8px] rounded-[8px]">
                      <Check size={14} className="text-white shrink-0" />
                      <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-white text-[14px]" style={{ fontVariationSettings: '"opsz" 14' }}>Approved</p>
                    </div>
                  ) : decision === "declined" ? (
                    <div className="flex-1 bg-[#d92d2d] border border-[#d92d2d] flex gap-[6px] items-center justify-center px-[12px] py-[8px] rounded-[8px]">
                      <X size={14} className="text-white shrink-0" />
                      <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-white text-[14px]" style={{ fontVariationSettings: '"opsz" 14' }}>Declined</p>
                    </div>
                  ) : (
                    <>
                      <button onClick={() => handleDecide("approved")} className="flex-1 bg-white flex gap-[6px] items-center justify-center px-[12px] py-[8px] rounded-[8px] border border-[#e1e9ef] cursor-pointer hover:bg-[#f0faf2] transition-colors">
                        <Check size={14} className="text-[#4a9237] shrink-0" />
                        <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[14px]" style={{ fontVariationSettings: '"opsz" 14' }}>Approve</p>
                      </button>
                      <button onClick={() => handleDecide("declined")} className="flex-1 bg-white flex gap-[6px] items-center justify-center px-[12px] py-[8px] rounded-[8px] border border-[#e1e9ef] cursor-pointer hover:bg-[#fdf2f0] transition-colors">
                        <X size={14} className="text-[#c7371a] shrink-0" />
                        <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[14px]" style={{ fontVariationSettings: '"opsz" 14' }}>Decline</p>
                      </button>
                    </>
                  )}
                </div>
                {(decision === "approved" || decision === "declined") && taskIndex < total - 1 && (
                  <button onClick={() => setTaskIndex(i => i + 1)} className="flex sm:hidden w-full gap-[6px] items-center justify-center px-[12px] py-[8px] rounded-[8px] bg-[#f6f6f6] text-[#262630] text-[14px] cursor-pointer hover:bg-[#ebebeb] transition-colors">
                    <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold" style={{ fontVariationSettings: '"opsz" 14' }}>Next Item</p>
                    <ChevronRight size={14} className="shrink-0" />
                  </button>
                )}
              </div>

              {/* Desktop approve/decline */}
              <div className="hidden sm:flex gap-[6px] items-center shrink-0">
                {decision === "approved" ? (
                  <>
                    <div className="bg-[#d1fae5] border border-[#a7f3d0] flex gap-[6px] items-center justify-center px-[10px] py-[4px] rounded-[8px] shrink-0">
                      <Check size={13} className="text-[#3a7a2c] shrink-0" />
                      <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold leading-[21px] text-[#3a7a2c] text-[13px] whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>Approved</p>
                    </div>
                    {taskIndex < total - 1 && (
                      <button onClick={() => setTaskIndex(i => i + 1)} className="bg-white flex gap-[6px] items-center justify-center px-[10px] py-[4px] rounded-[8px] shrink-0 border border-[#e1e9ef] cursor-pointer hover:bg-[#f3f4f6] transition-colors whitespace-nowrap">
                        <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold leading-[21px] text-[#262630] text-[13px]" style={{ fontVariationSettings: '"opsz" 14' }}>Next Item</p>
                        <ChevronRight size={13} className="shrink-0 text-[#262630]" />
                      </button>
                    )}
                  </>
                ) : decision === "declined" ? (
                  <>
                    <div className="bg-[#fee2e2] border border-[#fca5a5] flex gap-[6px] items-center justify-center px-[10px] py-[4px] rounded-[8px] shrink-0">
                      <X size={13} className="text-[#d92d2d] shrink-0" />
                      <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold leading-[21px] text-[#d92d2d] text-[13px] whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>Declined</p>
                    </div>
                    {taskIndex < total - 1 && (
                      <button onClick={() => setTaskIndex(i => i + 1)} className="bg-white flex gap-[6px] items-center justify-center px-[10px] py-[4px] rounded-[8px] shrink-0 border border-[#e1e9ef] cursor-pointer hover:bg-[#f3f4f6] transition-colors whitespace-nowrap">
                        <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold leading-[21px] text-[#262630] text-[13px]" style={{ fontVariationSettings: '"opsz" 14' }}>Next Item</p>
                        <ChevronRight size={13} className="shrink-0 text-[#262630]" />
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <button onClick={() => handleDecide("approved")} className="bg-white flex gap-[6px] items-center justify-center px-[10px] py-[4px] rounded-[8px] shrink-0 border border-[#e1e9ef] cursor-pointer hover:bg-[#f0faf2] transition-colors">
                      <Check size={13} className="text-[#3a7a2c] shrink-0" />
                      <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold leading-[21px] text-[#262630] text-[13px] whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>Approve</p>
                    </button>
                    <button onClick={() => handleDecide("declined")} className="bg-white flex gap-[6px] items-center justify-center px-[10px] py-[4px] rounded-[8px] shrink-0 border border-[#e1e9ef] cursor-pointer hover:bg-[#fdf2f0] transition-colors">
                      <X size={13} className="text-[#d92d2d] shrink-0" />
                      <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold leading-[21px] text-[#262630] text-[13px] whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>Decline</p>
                    </button>
                    <button className="bg-white flex gap-[6px] items-center justify-center px-[10px] py-[4px] rounded-[8px] shrink-0 border border-[#e1e9ef] cursor-pointer hover:bg-[#f0f6ff] transition-colors">
                      <Send size={13} className="text-[#247ae4] shrink-0" />
                      <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold leading-[21px] text-[#262630] text-[13px] whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>Message</p>
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail panel portal */}
      {detailTask && createPortal(
        <>
          <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setDetailTask(null)} />
          <div className="fixed top-0 right-0 h-full w-full max-w-[580px] bg-white shadow-[-4px_0_24px_rgba(0,0,0,0.1)] z-50 overflow-y-auto">
            <div className="flex flex-col gap-[24px] items-start pb-[60px] pt-[42px] px-[36px] w-full">

              <div className="flex items-start justify-between w-full shrink-0">
                <div className="flex flex-col gap-[4px]">
                  <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[20px] text-black leading-[1.2]" style={{ fontVariationSettings: '"opsz" 14' }}>
                    {detailTask.amount ? `Invoice – ${detailTask.accountNumber}` : detailTask.id}
                  </p>
                  <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] text-[14px]" style={{ fontVariationSettings: '"opsz" 14' }}>{detailTask.title}</p>
                </div>
                <button onClick={() => setDetailTask(null)} className="text-[#333] hover:text-black cursor-pointer p-[4px]">
                  <X size={16} />
                </button>
              </div>

              <button className="flex items-center gap-[6px] text-[#247ae4] text-[16px] font-['DM_Sans:SemiBold',sans-serif] font-semibold cursor-pointer hover:underline shrink-0" style={{ fontVariationSettings: '"opsz" 14' }}>
                View Attachments <Paperclip size={14} />
              </button>

              <div className="flex gap-[12px] items-center shrink-0">
                <button className="bg-white flex gap-[8px] items-center justify-center px-[22px] py-[10px] rounded-[8px] border border-[#e0e0e0] text-[#262630] text-[16px] font-['DM_Sans:SemiBold',sans-serif] font-semibold cursor-pointer hover:bg-[#f0faf2] transition-colors" style={{ fontVariationSettings: '"opsz" 14' }}>
                  <Check size={16} className="text-[#3a7a2c] shrink-0" /> Approve
                </button>
                <button className="bg-white flex gap-[8px] items-center justify-center px-[22px] py-[10px] rounded-[8px] border border-[#e0e0e0] text-[#262630] text-[16px] font-['DM_Sans:SemiBold',sans-serif] font-semibold cursor-pointer hover:bg-[#fdf2f0] transition-colors" style={{ fontVariationSettings: '"opsz" 14' }}>
                  <X size={16} className="text-[#d92d2d] shrink-0" /> Decline
                </button>
              </div>

              <div className="w-full h-px bg-[#e7e7e7] shrink-0" />

              <div className="flex flex-col gap-[12px] w-full shrink-0">
                {detailTask.amount ? (
                  <>
                    <DetailRow label="Invoice Date" value={detailTask.date ?? "—"} />
                    <DetailRow label="Invoice number" value={detailTask.accountNumber} />
                    <DetailRow label="GL Account" value={detailTask.glAccount ?? "—"} />
                    <DetailRow label="Step" value="Board Approval" />
                    <DetailRow label="Service Provider" value={detailTask.title} />
                    <DetailRow label="Total" value={detailTask.amount} />
                    <DetailRow label="Description" value={detailTask.description} multiLine />
                  </>
                ) : (
                  <>
                    <DetailRow label="Date Submitted" value="06/01/2026" />
                    <DetailRow label="Request ID" value={detailTask.id} />
                    <DetailRow label="Type" value={detailTask.typeLabel} />
                    <DetailRow label="Step" value="Under Review" />
                    <DetailRow label="Property Address" value={detailTask.address} />
                    <DetailRow label="Account Number" value={detailTask.accountNumber} />
                    <DetailRow label="Description" value={detailTask.description} multiLine />
                  </>
                )}
              </div>

              <div className="w-full h-px bg-[#e7e7e7] shrink-0" />

              <div className="w-full shrink-0">
                <div className="flex items-center border-b border-[#e7e7e7]">
                  {(["messages", "ledger", "recent"] as const).map((tab) => {
                    const label = tab === "messages" ? "Messages" : tab === "ledger" ? "General Ledger" : "Recent Invoices";
                    const active = detailTab === tab;
                    return (
                      <button
                        key={tab}
                        onClick={() => setDetailTab(tab)}
                        className={`px-[12px] py-[8px] text-[16px] cursor-pointer transition-colors relative ${active ? "font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#247ae4]" : "font-['DM_Sans:Medium',sans-serif] font-medium text-[#262630] hover:text-[#247ae4]"}`}
                        style={{ fontVariationSettings: '"opsz" 14' }}
                      >
                        {label}
                        {active && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#247ae4]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button className="bg-[#247ae4] flex items-center justify-center px-[16px] py-[8px] rounded-[8px] text-white text-[14px] font-['DM_Sans:SemiBold',sans-serif] font-semibold cursor-pointer hover:bg-[#1e6fd0] transition-colors shrink-0" style={{ fontVariationSettings: '"opsz" 14' }}>
                Message
              </button>

              {[
                { body: "The following invoice fields were changed: Invoice Date: 6/1/2026, Pay Type: Check Invoice Detail Added: GL: 2004 - Due To Reserve, Fund: Operating, Bank Account: Stripe Test Bank, Description: , Amount: $0.00", hasAttachment: false },
                { body: "The following invoice fields were changed: Invoice Date: 6/1/2026, Pay Type: Check Invoice Detail Added: GL: 2004 - Due To Reserve, Fund: Operating, Bank Account: Stripe Test Bank, Description: , Amount: $0.00", hasAttachment: true },
              ].map((msg, i) => (
                <div key={i} className="flex flex-col gap-[16px] py-[12px] w-full shrink-0 border-b border-[#e1e9ef]">
                  <div className="flex items-start justify-between w-full">
                    <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] text-[14px]" style={{ fontVariationSettings: '"opsz" 14' }}>To: Homeowner</p>
                    <div className="flex flex-col items-end gap-[4px]">
                      <p className="font-['DM_Sans:Medium',sans-serif] font-medium text-[#262630] text-[13px]" style={{ fontVariationSettings: '"opsz" 14' }}>6/01/26</p>
                      <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#4b5563] text-[13px]" style={{ fontVariationSettings: '"opsz" 14' }}>3:38 PM</p>
                    </div>
                  </div>
                  <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#4b5563] text-[14px] leading-[1.2] w-full" style={{ fontVariationSettings: '"opsz" 14' }}>{msg.body}</p>
                  {msg.hasAttachment && (
                    <button className="flex items-center gap-[6px] px-[16px] py-[10px] rounded-[8px] border border-[#e1e9ef] bg-white text-[#262630] text-[13px] font-['DM_Sans:SemiBold',sans-serif] font-semibold cursor-pointer hover:bg-[#f9fafb] shrink-0 self-start" style={{ fontVariationSettings: '"opsz" 14' }}>
                      View Attachment <Paperclip size={13} />
                    </button>
                  )}
                </div>
              ))}

            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
