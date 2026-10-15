import { useState } from "react";
import {
  Sparkles,
  History,
  ChevronRight,
  Paperclip,
  ArrowUp,
  Info,
  ChevronsRight,
} from "lucide-react";

const COMMON_QUESTIONS = [
  "What is my current account balance?",
  "How do I submit an architectural modification (ARC) request and track status?",
  "I received a violation—what is it for and how do I resolve/appeal it?",
  "What is the process to request a new pool key?",
];

export default function AskHoaiPanel() {
  const [input, setInput] = useState("");

  return (
    <aside
      data-ux-id="askhoai-panel"
      className="hidden lg:flex flex-col shrink-0 w-[400px] bg-white border-l border-[#e5eaf0] h-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#e5eaf0]">
        <div className="flex items-center gap-1.5">
          <span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[15px] text-[#247ae4]">
            Ask HOAi
          </span>
          <Sparkles size={14} className="text-[#247ae4]" />
        </div>
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
            className="p-1.5 rounded-md border border-[#e5eaf0] text-[#262630] hover:bg-black/[0.03]"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-4">
        <h2 className="font-['DM_Sans:Bold',sans-serif] font-bold text-[22px] text-[#262630] leading-tight">
          Welcome back, james.polk
        </h2>
        <p className="text-[13px] text-[#5a5a66] mt-1">How can I help you today?</p>

        {/* Input */}
        <div className="mt-5 border-2 border-[#247ae4] rounded-xl p-3 bg-white">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Hello! How can I help you today?"
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
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#8ab6ec] text-white text-[13px] rounded-full hover:bg-[#6ea0e0] disabled:opacity-70"
              disabled={!input.trim()}
            >
              <ArrowUp size={13} /> Send
            </button>
          </div>
        </div>

        {/* Common questions */}
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
    </aside>
  );
}
