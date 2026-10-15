import { useMemo, useState } from "react";
import {
  Menu,
  Search,
  SlidersHorizontal,
  HelpCircle,
  Settings,
  Grid3x3,
  Sparkles,
  Inbox as InboxIcon,
  Star,
  Clock,
  AlertCircle,
  Send,
  FileText,
  ShoppingBag,
  Users,
  Info,
  Tag,
  ChevronDown,
  Pencil,
  RotateCw,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Mail,
  Archive,
  Trash2,
  MailOpen,
  Timer,
  ArrowLeft,
  Printer,
  ExternalLink,
  CornerUpLeft,
  CornerUpRight,
  Reply,
} from "lucide-react";

type EmailCategory = "primary" | "promotions" | "social" | "updates";

type Email = {
  id: string;
  sender: string;
  subject: string;
  snippet: string;
  time: string;
  unread: boolean;
  starred: boolean;
  important: boolean;
  category: EmailCategory;
  avatarColor: string;
  avatarInitial: string;
  isHoa?: boolean;
};

const EMAILS: Email[] = [
  {
    id: "hoa-welcome",
    sender: "Waterfront Community Estates",
    subject: "Welcome home — finish setting up your resident portal",
    snippet:
      "Your HOA account is ready. Register in a couple of minutes to pay dues, reserve amenities, and get community updates.",
    time: "7:48 PM",
    unread: true,
    starred: false,
    important: true,
    category: "primary",
    avatarColor: "#1a7f4b",
    avatarInitial: "P",
    isHoa: true,
  },
  {
    id: "e2",
    sender: "Northside Fitness",
    subject: "October class schedule now live",
    snippet:
      "Browse the full lineup and reserve your spot — morning yoga and evening HIIT fill up quickly.",
    time: "6:09 PM",
    unread: false,
    starred: false,
    important: false,
    category: "primary",
    avatarColor: "#d9534f",
    avatarInitial: "N",
  },
  {
    id: "e3",
    sender: "Pacific Trail Outfitters",
    subject: "Fall gear event — up to 40% off",
    snippet:
      "Pick up new layers before the next storm rolls in. Members get early access all weekend.",
    time: "6:00 PM",
    unread: false,
    starred: false,
    important: false,
    category: "primary",
    avatarColor: "#4a8a3f",
    avatarInitial: "P",
  },
  {
    id: "e4",
    sender: "Beacon Equipment Co.",
    subject: "Scratch & dent — limited inventory",
    snippet:
      "Save up to $820 on floor models. First come, first served through Sunday.",
    time: "4:30 PM",
    unread: false,
    starred: false,
    important: false,
    category: "promotions",
    avatarColor: "#2d5f8c",
    avatarInitial: "B",
  },
  {
    id: "e5",
    sender: "Daily Dispatch",
    subject: "The morning brief: three stories to start your day",
    snippet:
      "A quick read with the top headlines, a chart worth your time, and a cultural recommendation.",
    time: "4:17 PM",
    unread: false,
    starred: false,
    important: false,
    category: "primary",
    avatarColor: "#111111",
    avatarInitial: "D",
  },
  {
    id: "e6",
    sender: "Westline League",
    subject: "What's in a name? The story behind the volunteers",
    snippet:
      "This month's spotlight on the parents and coaches who make Saturday mornings possible.",
    time: "4:06 PM",
    unread: false,
    starred: false,
    important: false,
    category: "primary",
    avatarColor: "#b7472a",
    avatarInitial: "W",
  },
  {
    id: "e7",
    sender: "Harbor Credit Union",
    subject: "Your September statement is ready",
    snippet:
      "View your statement in online banking or download a PDF for your records.",
    time: "3:22 PM",
    unread: false,
    starred: false,
    important: true,
    category: "updates",
    avatarColor: "#1f5f8a",
    avatarInitial: "H",
  },
  {
    id: "e8",
    sender: "HeliDirect",
    subject: "New video: Unboxing, build & first flight",
    snippet:
      "Pilot Dan walks through the XL Stratos 700 from box to maiden voyage.",
    time: "3:04 PM",
    unread: false,
    starred: false,
    important: false,
    category: "promotions",
    avatarColor: "#c33b2f",
    avatarInitial: "H",
  },
  {
    id: "e9",
    sender: "Rowan & Co.",
    subject: "Thanks for your payment!",
    snippet:
      "You just made a $194.00 payment with your Visa ending in 5689. Order #RC-19382 confirmed.",
    time: "2:46 PM",
    unread: false,
    starred: false,
    important: false,
    category: "updates",
    avatarColor: "#6b4e9a",
    avatarInitial: "R",
  },
  {
    id: "e10",
    sender: "LendingTree",
    subject: "Your home's value has changed",
    snippet:
      "Get a quick look at what's different this month and where comparable homes are landing.",
    time: "11:16 AM",
    unread: false,
    starred: false,
    important: false,
    category: "promotions",
    avatarColor: "#2fa84f",
    avatarInitial: "L",
  },
  {
    id: "e11",
    sender: "Beacon Equipment Co.",
    subject: "Gear up now, up to 40% off!",
    snippet: "Time to level up — fall essentials across every category.",
    time: "11:15 AM",
    unread: false,
    starred: false,
    important: false,
    category: "promotions",
    avatarColor: "#2d5f8c",
    avatarInitial: "B",
  },
  {
    id: "e12",
    sender: "Cased",
    subject: "1,693 riders weighed in. Here's the verdict.",
    snippet:
      "4.9/5 from verified riders. Three pieces of CE Level 2 protection for $199.",
    time: "11:01 AM",
    unread: false,
    starred: false,
    important: false,
    category: "promotions",
    avatarColor: "#f0a830",
    avatarInitial: "C",
  },
  {
    id: "e13",
    sender: "Mesa Running Club",
    subject: "Saturday long run — meet at the trailhead",
    snippet:
      "9 AM start, 8 miles on the ridgeline route, optional coffee after at the lodge.",
    time: "10:21 AM",
    unread: false,
    starred: true,
    important: false,
    category: "social",
    avatarColor: "#2f6fd3",
    avatarInitial: "M",
  },
  {
    id: "e14",
    sender: "CaptainU",
    subject: "Hey Oliver, 2 coaches found you in a search.",
    snippet:
      "Log in to chat with them now! To view this email as a web page, go here.",
    time: "9:28 AM",
    unread: false,
    starred: false,
    important: false,
    category: "updates",
    avatarColor: "#8a3a8f",
    avatarInitial: "C",
  },
  {
    id: "e15",
    sender: "Reef Supply",
    subject: "Your reef is growing",
    snippet:
      "Another step toward your dream reef — a few new corals that'll ship next week.",
    time: "9:12 AM",
    unread: false,
    starred: false,
    important: false,
    category: "promotions",
    avatarColor: "#2fa08a",
    avatarInitial: "R",
  },
  {
    id: "e16",
    sender: "Wohven",
    subject: "Coming next week…",
    snippet:
      "The past design event starts on Monday. A preview of what we're shipping.",
    time: "9:06 AM",
    unread: false,
    starred: false,
    important: false,
    category: "promotions",
    avatarColor: "#111111",
    avatarInitial: "W",
  },
  {
    id: "e17",
    sender: "SaltwaterAquarium.c.",
    subject: "Fresh gear alert: Red Sea Reefer G3+ & more!",
    snippet:
      "Take a second look at Red Sea's new G3+ line and check out the latest fragrant.",
    time: "9:03 AM",
    unread: false,
    starred: false,
    important: false,
    category: "promotions",
    avatarColor: "#1f6e8a",
    avatarInitial: "S",
  },
  {
    id: "e18",
    sender: "Discover by Capital",
    subject: "Set up your Capital One access to keep your paperless statements",
    snippet:
      "Oliver, keep your delivery digital. Opt in now and we'll handle the rest.",
    time: "7:22 AM",
    unread: false,
    starred: false,
    important: false,
    category: "updates",
    avatarColor: "#e07a2a",
    avatarInitial: "D",
  },
  {
    id: "e19",
    sender: "Puzzlebox Weekly",
    subject: "Gameplay: 500 hours of puzzles to explode your mind",
    snippet:
      "Plus, the history of APU in crossword grids and a brand new daily jumble.",
    time: "Yesterday",
    unread: false,
    starred: false,
    important: false,
    category: "promotions",
    avatarColor: "#111111",
    avatarInitial: "P",
  },
];

const CATEGORIES: {
  key: EmailCategory;
  label: string;
  icon: typeof InboxIcon;
  badge?: string;
  sub?: string;
}[] = [
  { key: "primary", label: "Primary", icon: InboxIcon },
  {
    key: "promotions",
    label: "Promotions",
    icon: Tag,
    badge: "9 new",
    sub: "Beacon — Fall event",
  },
  { key: "social", label: "Social", icon: Users },
  { key: "updates", label: "Updates", icon: Info },
];

const NAV_PRIMARY: {
  label: string;
  icon: typeof InboxIcon;
  count?: string;
  active?: boolean;
}[] = [
  { label: "Inbox", icon: InboxIcon, count: "4,201", active: true },
  { label: "Starred", icon: Star },
  { label: "Snoozed", icon: Clock },
  { label: "Important", icon: AlertCircle },
  { label: "Sent", icon: Send },
  { label: "Drafts", icon: FileText, count: "12" },
  { label: "Purchases", icon: ShoppingBag, count: "248" },
  { label: "Social", icon: Users, count: "77" },
  { label: "Updates", icon: Info, count: "4,120" },
  { label: "Forums", icon: Mail },
  { label: "Promotions", icon: Tag, count: "10,879" },
];

const LABELS: { label: string; color: string }[] = [
  { label: "[Imap]/Drafts", color: "#5f6368" },
  { label: "Deleted Messages", color: "#5f6368" },
  { label: "Personal", color: "#5f6368" },
  { label: "Sent Messages", color: "#5f6368" },
];

function Sidebar() {
  return (
    <aside className="w-[256px] shrink-0 flex-col pb-2 pr-3 hidden md:flex">
      <div className="h-16 flex items-center gap-3 pl-2 pr-4 text-[#444746]">
        <button
          type="button"
          className="p-3 rounded-full hover:bg-[#e7e8eb]"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <span className="text-[22px] font-normal text-[#5f6368] tracking-tight">
          Mail
        </span>
      </div>
      <div className="px-4">
        <button
          type="button"
          className="flex items-center gap-3 rounded-2xl bg-[#c2e7ff] px-4 py-3 pr-6 text-[14px] font-medium text-[#001d35] shadow-sm hover:shadow transition-shadow"
        >
          <Pencil size={20} />
          Compose
        </button>
      </div>
      <nav className="mt-3 flex-1 overflow-y-auto">
        <ul>
          {NAV_PRIMARY.map((item) => (
            <li key={item.label}>
              <button
                type="button"
                className={`w-full flex items-center gap-5 pl-6 pr-5 py-[6px] text-[14px] rounded-r-full ${
                  item.active
                    ? "bg-[#d3e3fd] font-bold text-[#001d35]"
                    : "text-[#444746] hover:bg-[#e7e8eb]"
                }`}
              >
                <item.icon size={18} className="shrink-0" />
                <span className="flex-1 text-left truncate">{item.label}</span>
                {item.count && (
                  <span className="text-[12px] tabular-nums">{item.count}</span>
                )}
              </button>
            </li>
          ))}
          <li>
            <button
              type="button"
              className="w-full flex items-center gap-5 pl-6 pr-5 py-[6px] text-[14px] text-[#444746] hover:bg-[#e7e8eb] rounded-r-full"
            >
              <ChevronDown size={18} className="shrink-0" />
              <span className="flex-1 text-left">More</span>
            </button>
          </li>
        </ul>
        <div className="mt-4 px-6 flex items-center justify-between">
          <span className="text-[14px] text-[#444746]">Labels</span>
          <button
            type="button"
            className="text-[#444746] hover:bg-[#e7e8eb] rounded-full p-1"
            aria-label="Add label"
          >
            <span className="block w-4 h-4 leading-4 text-center">+</span>
          </button>
        </div>
        <ul className="mt-1">
          {LABELS.map((l) => (
            <li key={l.label}>
              <button
                type="button"
                className="w-full flex items-center gap-5 pl-6 pr-5 py-[6px] text-[14px] text-[#444746] hover:bg-[#e7e8eb] rounded-r-full"
              >
                <span
                  className="w-4 h-4 rounded-sm border"
                  style={{ borderColor: l.color }}
                />
                <span className="flex-1 text-left truncate">{l.label}</span>
              </button>
            </li>
          ))}
          <li>
            <button
              type="button"
              className="w-full flex items-center gap-5 pl-6 pr-5 py-[6px] text-[14px] text-[#444746] hover:bg-[#e7e8eb] rounded-r-full"
            >
              <ChevronDown size={18} className="shrink-0" />
              <span className="flex-1 text-left">More</span>
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

function TopBar() {
  return (
    <header className="h-16 shrink-0 flex items-center gap-4 px-4 bg-[#f8fafd]">
      <div className="flex-1 max-w-[720px]">
        <div className="flex items-center gap-3 bg-[#e9eef6] hover:bg-[#e1e7f1] focus-within:bg-white focus-within:shadow-md transition-colors rounded-full px-5 h-12">
          <Search size={20} className="text-[#444746] shrink-0" />
          <input
            type="text"
            placeholder="Ask Mail"
            className="flex-1 bg-transparent outline-none text-[14px] text-[#1f1f1f] placeholder:text-[#5f6368]"
          />
          <button
            type="button"
            className="p-2 rounded-full hover:bg-black/5 text-[#444746]"
            aria-label="Search options"
          >
            <SlidersHorizontal size={18} />
          </button>
        </div>
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-1 text-[#444746]">
        <button
          type="button"
          className="p-3 rounded-full hover:bg-[#e7e8eb]"
          aria-label="Support"
        >
          <HelpCircle size={20} />
        </button>
        <button
          type="button"
          className="p-3 rounded-full hover:bg-[#e7e8eb]"
          aria-label="Settings"
        >
          <Settings size={20} />
        </button>
        <button
          type="button"
          className="p-3 rounded-full hover:bg-[#e7e8eb]"
          aria-label="AI"
        >
          <Sparkles size={20} />
        </button>
        <button
          type="button"
          className="p-3 rounded-full hover:bg-[#e7e8eb]"
          aria-label="Apps"
        >
          <Grid3x3 size={20} />
        </button>
        <div
          className="ml-1 w-9 h-9 rounded-full border-2 border-[#2fa84f] grid place-items-center text-white text-[14px] font-medium"
          style={{ background: "#2d6cdf" }}
        >
          O
        </div>
      </div>
    </header>
  );
}

function CategoryTabs({
  active,
  onChange,
}: {
  active: EmailCategory;
  onChange: (c: EmailCategory) => void;
}) {
  return (
    <div className="flex items-stretch border-b border-[#e5e7eb]">
      {CATEGORIES.map((c) => {
        const isActive = c.key === active;
        return (
          <button
            key={c.key}
            type="button"
            onClick={() => onChange(c.key)}
            className={`relative flex items-center gap-3 px-6 py-3 min-w-[160px] text-[14px] ${
              isActive ? "text-[#0b57d0]" : "text-[#444746] hover:bg-[#e7e8eb]"
            }`}
          >
            <c.icon size={18} />
            <div className="flex flex-col items-start leading-tight">
              <div className="flex items-center gap-2">
                <span className={isActive ? "font-medium" : ""}>{c.label}</span>
                {c.badge && (
                  <span className="rounded-md bg-[#188038] text-white text-[11px] font-medium px-1.5 py-[2px]">
                    {c.badge}
                  </span>
                )}
              </div>
              {c.sub && (
                <span className="text-[12px] text-[#5f6368] mt-[2px]">
                  {c.sub}
                </span>
              )}
            </div>
            {isActive && (
              <span className="absolute left-0 right-0 bottom-[-1px] h-[3px] bg-[#0b57d0] rounded-t-sm" />
            )}
          </button>
        );
      })}
    </div>
  );
}

function Toolbar() {
  return (
    <div className="h-12 shrink-0 flex items-center justify-between px-3 border-b border-transparent">
      <div className="flex items-center gap-1 text-[#444746]">
        <button
          type="button"
          className="flex items-center gap-1 p-2 rounded-full hover:bg-[#e7e8eb]"
          aria-label="Select"
        >
          <CheckSquare size={18} />
          <ChevronDown size={14} />
        </button>
        <button
          type="button"
          className="p-2 rounded-full hover:bg-[#e7e8eb]"
          aria-label="Refresh"
        >
          <RotateCw size={18} />
        </button>
        <button
          type="button"
          className="p-2 rounded-full hover:bg-[#e7e8eb]"
          aria-label="More"
        >
          <MoreVertical size={18} />
        </button>
      </div>
      <div className="flex items-center gap-2 text-[#444746]">
        <span className="text-[12px] tabular-nums">1–50 of 47,174</span>
        <button
          type="button"
          className="p-2 rounded-full hover:bg-[#e7e8eb]"
          aria-label="Newer"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type="button"
          className="p-2 rounded-full hover:bg-[#e7e8eb]"
          aria-label="Older"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

function Avatar({ color, initial }: { color: string; initial: string }) {
  return (
    <div
      className="w-6 h-6 rounded-full grid place-items-center text-[11px] text-white font-medium shrink-0"
      style={{ background: color }}
    >
      {initial}
    </div>
  );
}

function HoverActions() {
  return (
    <div className="hidden group-hover:flex items-center gap-1 text-[#444746] bg-white px-2 h-full">
      <button
        type="button"
        className="p-1.5 rounded-full hover:bg-[#e7e8eb]"
        aria-label="Archive"
        onClick={(e) => e.stopPropagation()}
      >
        <Archive size={16} />
      </button>
      <button
        type="button"
        className="p-1.5 rounded-full hover:bg-[#e7e8eb]"
        aria-label="Delete"
        onClick={(e) => e.stopPropagation()}
      >
        <Trash2 size={16} />
      </button>
      <button
        type="button"
        className="p-1.5 rounded-full hover:bg-[#e7e8eb]"
        aria-label="Mark as unread"
        onClick={(e) => e.stopPropagation()}
      >
        <MailOpen size={16} />
      </button>
      <button
        type="button"
        className="p-1.5 rounded-full hover:bg-[#e7e8eb]"
        aria-label="Snooze"
        onClick={(e) => e.stopPropagation()}
      >
        <Timer size={16} />
      </button>
    </div>
  );
}

function EmailRow({
  email,
  onOpen,
}: {
  email: Email;
  onOpen: (id: string) => void;
}) {
  const bold = email.unread;
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(email.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(email.id);
        }
      }}
      className={`group relative flex items-stretch h-11 cursor-pointer border-b border-[#e8eaed] ${
        bold ? "bg-white" : "bg-[#f2f6fc]"
      } hover:bg-white hover:shadow-[inset_1px_0_0_#dadce0,inset_-1px_0_0_#dadce0,0_1px_2px_0_rgba(60,64,67,.3),0_1px_3px_1px_rgba(60,64,67,.15)]`}
    >
      <div className="flex items-center pl-3 gap-2 text-[#5f6368]">
        <button
          type="button"
          className="p-1 rounded hover:bg-[#e7e8eb]"
          onClick={(e) => e.stopPropagation()}
          aria-label="Select"
        >
          <span className="block w-[16px] h-[16px] rounded-sm border border-[#5f6368]" />
        </button>
        <button
          type="button"
          className="p-1 rounded hover:bg-[#e7e8eb]"
          onClick={(e) => e.stopPropagation()}
          aria-label="Star"
        >
          <Star
            size={16}
            className={email.starred ? "fill-[#f4b400] text-[#f4b400]" : ""}
          />
        </button>
        <button
          type="button"
          className="p-1 rounded hover:bg-[#e7e8eb]"
          onClick={(e) => e.stopPropagation()}
          aria-label="Important"
        >
          <span className="block text-[14px] font-semibold">
            {email.important ? "»" : "›"}
          </span>
        </button>
      </div>
      <div className="flex items-center pl-3 w-[280px] shrink-0">
        <span
          className={`truncate text-[14px] ${
            bold ? "font-bold text-[#202124]" : "text-[#5f6368]"
          }`}
        >
          {email.sender}
        </span>
      </div>
      <div className="flex-1 min-w-0 flex items-center pl-2 pr-3">
        <div className="truncate text-[14px]">
          <span
            className={bold ? "font-bold text-[#202124]" : "text-[#5f6368]"}
          >
            {email.subject}
          </span>
          <span className="text-[#5f6368]"> - {email.snippet}</span>
        </div>
      </div>
      <div className="flex items-center pr-4 w-[90px] justify-end shrink-0 relative">
        <span
          className={`text-[12px] tabular-nums ${
            bold ? "font-bold text-[#202124]" : "text-[#5f6368]"
          } group-hover:hidden`}
        >
          {email.time}
        </span>
        <HoverActions />
      </div>
    </div>
  );
}

function EmailList({
  emails,
  onOpen,
  activeTab,
  onTabChange,
}: {
  emails: Email[];
  onOpen: (id: string) => void;
  activeTab: EmailCategory;
  onTabChange: (c: EmailCategory) => void;
}) {
  return (
    <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-[0_0_4px_0_rgba(60,64,67,0.15)] overflow-hidden">
      <Toolbar />
      <CategoryTabs active={activeTab} onChange={onTabChange} />
      <div className="flex-1 overflow-y-auto">
        {emails.length === 0 ? (
          <div className="h-full grid place-items-center text-[#5f6368] text-[14px]">
            No conversations here.
          </div>
        ) : (
          emails.map((email) => (
            <EmailRow key={email.id} email={email} onOpen={onOpen} />
          ))
        )}
      </div>
    </div>
  );
}

function HoaEmailBody({ onRegister }: { onRegister: () => void }) {
  return (
    <div className="text-[14px] text-[#202124] leading-6 space-y-4">
      <p>Hi Oliver,</p>
      <p>
        Welcome to the Waterfront Community Estates! Your resident account has
        been
        created and is ready for you to activate. Registering only takes a
        couple of minutes and gives you access to:
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li>Online dues payment and autopay</li>
        <li>Amenity reservations (pool, tennis, clubhouse)</li>
        <li>HOA announcements, polls, and board updates</li>
        <li>Direct messaging with your community manager</li>
      </ul>
      <div className="pt-2">
        <button
          type="button"
          onClick={onRegister}
          className="inline-flex items-center gap-2 rounded-full bg-[#0b57d0] text-white text-[14px] font-medium px-5 py-2.5 hover:bg-[#0a4bb3] shadow-sm"
        >
          Register for the resident portal
        </button>
      </div>
      <p>
        If you have any questions, reply to this email or call the management
        office during business hours.
      </p>
      <p className="pt-2 text-[#5f6368]">
        — Waterfront Community Estates HOA
      </p>
    </div>
  );
}

function GenericEmailBody({ email }: { email: Email }) {
  return (
    <div className="text-[14px] text-[#202124] leading-6 space-y-4">
      <p>Hi there,</p>
      <p>{email.snippet}</p>
      <p>
        This is a placeholder preview. In a real inbox, the full body of this
        message would appear here with formatting, images, and any attachments.
      </p>
      <p className="pt-2 text-[#5f6368]">— {email.sender}</p>
    </div>
  );
}

function EmailView({
  email,
  onBack,
  onRegister,
}: {
  email: Email;
  onBack: () => void;
  onRegister: () => void;
}) {
  return (
    <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-[0_0_4px_0_rgba(60,64,67,0.15)] overflow-hidden">
      <div className="h-12 shrink-0 flex items-center gap-1 px-3 border-b border-[#f1f3f4] text-[#444746]">
        <button
          type="button"
          onClick={onBack}
          className="p-2 rounded-full hover:bg-[#e7e8eb]"
          aria-label="Back to inbox"
        >
          <ArrowLeft size={18} />
        </button>
        <button
          type="button"
          className="p-2 rounded-full hover:bg-[#e7e8eb]"
          aria-label="Archive"
        >
          <Archive size={18} />
        </button>
        <button
          type="button"
          className="p-2 rounded-full hover:bg-[#e7e8eb]"
          aria-label="Delete"
        >
          <Trash2 size={18} />
        </button>
        <button
          type="button"
          className="p-2 rounded-full hover:bg-[#e7e8eb]"
          aria-label="Mark as unread"
        >
          <MailOpen size={18} />
        </button>
        <button
          type="button"
          className="p-2 rounded-full hover:bg-[#e7e8eb]"
          aria-label="Snooze"
        >
          <Timer size={18} />
        </button>
        <div className="flex-1" />
        <span className="text-[12px] text-[#5f6368] tabular-nums">
          1 of 47,174
        </span>
        <button
          type="button"
          className="p-2 rounded-full hover:bg-[#e7e8eb]"
          aria-label="Newer"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type="button"
          className="p-2 rounded-full hover:bg-[#e7e8eb]"
          aria-label="Older"
        >
          <ChevronRight size={18} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[920px] mx-auto px-10 py-6">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-[22px] font-normal text-[#202124] flex-1">
              {email.subject}
            </h1>
            <div className="flex items-center gap-1 text-[#5f6368]">
              <button
                type="button"
                className="p-2 rounded-full hover:bg-[#e7e8eb]"
                aria-label="Print"
              >
                <Printer size={18} />
              </button>
              <button
                type="button"
                className="p-2 rounded-full hover:bg-[#e7e8eb]"
                aria-label="Open in new window"
              >
                <ExternalLink size={18} />
              </button>
            </div>
          </div>
          <div className="mt-6 flex items-start gap-4">
            <Avatar color={email.avatarColor} initial={email.avatarInitial} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-medium text-[#202124]">
                  {email.sender}
                </span>
                <span className="text-[12px] text-[#5f6368]">
                  &lt;no-reply@{email.sender.toLowerCase().replace(/[^a-z0-9]+/g, "")}.com&gt;
                </span>
              </div>
              <div className="text-[12px] text-[#5f6368] mt-[2px]">
                to me &nbsp;·&nbsp; {email.time}
              </div>
            </div>
            <div className="flex items-center gap-1 text-[#5f6368]">
              <button
                type="button"
                className="p-2 rounded-full hover:bg-[#e7e8eb]"
                aria-label="Reply"
              >
                <Reply size={18} />
              </button>
              <button
                type="button"
                className="p-2 rounded-full hover:bg-[#e7e8eb]"
                aria-label="More"
              >
                <MoreVertical size={18} />
              </button>
            </div>
          </div>
          <div className="mt-8">
            {email.isHoa ? (
              <HoaEmailBody onRegister={onRegister} />
            ) : (
              <GenericEmailBody email={email} />
            )}
          </div>
          <div className="mt-10 flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-[#dadce0] text-[14px] text-[#202124] px-5 py-2 hover:bg-[#f1f3f4]"
            >
              <CornerUpLeft size={16} /> Reply
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-[#dadce0] text-[14px] text-[#202124] px-5 py-2 hover:bg-[#f1f3f4]"
            >
              <CornerUpRight size={16} /> Forward
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

type InboxPageProps = {
  onRegister: () => void;
};

export default function InboxPage({ onRegister }: InboxPageProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<EmailCategory>("primary");

  const visibleEmails = useMemo(
    () => EMAILS.filter((e) => e.category === activeTab),
    [activeTab],
  );
  const selected = selectedId
    ? EMAILS.find((e) => e.id === selectedId) ?? null
    : null;

  return (
    <div className="flex h-full w-full bg-[#f8fafd]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <div className="flex-1 flex min-h-0 px-3 pt-2 pb-3">
          {selected ? (
            <EmailView
              email={selected}
              onBack={() => setSelectedId(null)}
              onRegister={onRegister}
            />
          ) : (
            <EmailList
              emails={visibleEmails}
              onOpen={setSelectedId}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          )}
        </div>
      </div>
    </div>
  );
}
