import { Fragment, useEffect, useState } from "react";
import { imgScreenshot20260109At35226Pm1 } from "../imports/svg-9a9bp";
import NewResidentFlow from "./onboarding/NewResidentFlow";
import BoardTasksWidget from "./board/BoardTasksWidget";
import AmenitiesPage from "./amenities/AmenitiesPage";

const isDemoMode = () => typeof window !== "undefined" && new URLSearchParams(window.location.search).has("demo");

/* ─── Icons — outlined stroke style matching FA Regular weight ─── */

const SZ = { width: 16, height: 16, fill: "none" as const, stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, className: "shrink-0" };

/* fa-inbox */
function IconInbox() {
  return (
    <svg {...SZ} viewBox="0 0 24 24">
      <path d="M22 12h-6l-2 3H10l-2-3H2"/>
      <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/>
    </svg>
  );
}

/* fa-house */
function IconHome() {
  return (
    <svg {...SZ} viewBox="0 0 24 24">
      <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
    </svg>
  );
}

/* fa-credit-card */
function IconPayments() {
  return (
    <svg {...SZ} viewBox="0 0 24 24">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
      <line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  );
}

/* fa-box-ballot */
function IconVote({ active = false }: { active?: boolean }) {
  return (
    <svg width="17" height="15" viewBox="0 0 17 15" fill="none" className="shrink-0">
      <path d="M5.15625 6.09375H11.7188V1.40625H5.15625V6.09375ZM3.75 0.9375C3.75 0.439453 4.16016 0 4.6875 0H12.1875C12.6855 0 13.125 0.439453 13.125 0.9375V6.5625C13.125 7.08984 12.6855 7.5 12.1875 7.5H4.6875C4.16016 7.5 3.75 7.08984 3.75 6.5625V0.9375ZM1.40625 4.6875H2.8125V6.09375H1.40625V9.375H15.4688V6.09375H14.0625V4.6875H15.4688C16.2305 4.6875 16.875 5.33203 16.875 6.09375V9.375V10.0781V10.7812V13.5938C16.875 14.3848 16.2305 15 15.4688 15H1.40625C0.615234 15 0 14.3848 0 13.5938V10.7812V10.0781V9.375V6.09375C0 5.33203 0.615234 4.6875 1.40625 4.6875ZM15.4688 10.7812H1.40625V13.5938H15.4688V10.7812Z" fill={active ? "#247AE4" : "#262630"}/>
    </svg>
  );
}

/* fa-address-card */
function IconFeed() {
  return (
    <svg {...SZ} viewBox="0 0 24 24">
      <rect x="1" y="4" width="22" height="16" rx="2"/>
      <circle cx="8" cy="11" r="2.5"/>
      <path d="M4.5 20a3.5 3.5 0 017 0"/>
      <line x1="14" y1="8" x2="21" y2="8"/>
      <line x1="14" y1="12" x2="21" y2="12"/>
    </svg>
  );
}

/* fa-paper-plane */
function IconRequests() {
  return (
    <svg {...SZ} viewBox="0 0 24 24">
      <line x1="22" y1="2" x2="11" y2="13"/>
      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  );
}

/* fa-folder-open */
function IconDocuments() {
  return (
    <svg {...SZ} viewBox="0 0 24 24">
      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
    </svg>
  );
}

/* fa-address-book */
function IconDirectory() {
  return (
    <svg {...SZ} viewBox="0 0 24 24">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
      <circle cx="13" cy="9" r="2"/>
      <path d="M10 13.5a3 3 0 016 0"/>
    </svg>
  );
}

/* fa-calendar */
function IconCalendar() {
  return (
    <svg {...SZ} viewBox="0 0 24 24">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );
}

/* fa-address-card */
function IconProfile() {
  return (
    <svg {...SZ} viewBox="0 0 24 24">
      <rect x="1" y="4" width="22" height="16" rx="2"/>
      <circle cx="8" cy="11" r="2.5"/>
      <path d="M4.5 20a3.5 3.5 0 017 0"/>
      <line x1="14" y1="8" x2="21" y2="8"/>
      <line x1="14" y1="12" x2="21" y2="12"/>
    </svg>
  );
}

/* fa-right-from-bracket */
function IconLogout() {
  return (
    <svg {...SZ} viewBox="0 0 24 24">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  );
}

/* fa-bell */
function IconBell({ width = 17, height = 19 }: { width?: number; height?: number }) {
  return (
    <svg width={width} height={height} viewBox="0 0 448 512" fill="#247ae4" className="shrink-0">
      <path d="M224 0c-17.7 0-32 14.3-32 32V51.2C119 66 64 130.6 64 208v18.8c0 47-17.3 92.4-48.5 127.6l-7.4 8.3c-8.4 9.4-10.4 22.9-5.3 34.4S19.4 416 32 416H416c12.6 0 24-7.4 29.2-18.9s3.1-25-5.3-34.4l-7.4-8.3C401.3 319.2 384 273.9 384 226.8V208c0-77.4-55-142-128-156.8V32c0-17.7-14.3-32-32-32zm45.3 493.3C262.8 505.9 244.2 512 224 512s-38.8-6.1-45.3-18.7c-3.8-7.2-1-16.1 6.2-19.9s16.1-1 19.9 6.2c2.5 4.8 10.7 8.4 19.2 8.4s16.7-3.6 19.2-8.4c3.8-7.2 12.7-10 19.9-6.2s10 12.7 6.2 19.9z"/>
    </svg>
  );
}

/* fa-chevron-down */
function IconChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 512 512" fill="currentColor" className="shrink-0">
      <path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"/>
    </svg>
  );
}

/* fa-chevron-right */
function IconChevronRight() {
  return (
    <svg width="10" height="14" viewBox="0 0 320 512" fill="currentColor" className="shrink-0">
      <path d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"/>
    </svg>
  );
}

/* fa-circle-question */
function IconQuestion() {
  return (
    <svg width="14" height="14" viewBox="0 0 512 512" fill="currentColor" className="shrink-0">
      <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM169.8 165.3c7.9-22.3 29.1-37.3 52.8-37.3h58.3c34.9 0 63.1 28.3 63.1 63.1c0 22.6-12.1 43.5-31.7 54.8L280 264.4c-.2 13-10.9 23.6-24 23.6c-13.3 0-24-10.7-24-24V250.5c0-8.6 4.6-16.5 12.1-20.8l44.3-25.4c4.7-2.7 7.6-7.7 7.6-13.1c0-8.4-6.8-15.1-15.1-15.1H222.6c-3.4 0-6.4 2.1-7.5 5.3l-.4 1.2c-4.4 12.5-18.2 19-30.6 14.6s-19-18.2-14.6-30.6l.4-1.2zM224 352a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z"/>
    </svg>
  );
}

/* ─── Address / User Card ─── */
function AddressCard() {
  return (
    <div data-ux-id="address-card" className="bg-white drop-shadow-[0px_2px_9px_rgba(18,17,48,0.09)] flex gap-[13px] items-center pl-[15px] pr-[21px] py-[12px] rounded-[18px] shrink-0 w-[380px]">
      <div className="relative shrink-0 size-[52px]">
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <img src="/Mask_group.png" alt="" className="w-full h-full object-cover" />
        </div>
        <svg className="absolute" style={{ left: 12, right: 0, bottom: 0, top: 12 }} width="27" height="27" viewBox="0 0 24 24" fill="none">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#f03434" stroke="none"/>
        </svg>
      </div>
      <div className="flex flex-[1_0_0] flex-col gap-[3px] items-start min-w-px">
        <p className="font-['DM_Sans:Bold',sans-serif] font-bold leading-normal text-[#262630] text-[16px] w-full" style={{ fontVariationSettings: '"opsz" 14' }}>Madison Green</p>
        <div className="font-['DM_Sans:Medium',sans-serif] font-medium opacity-65 text-[#262630] text-[14px]" style={{ fontVariationSettings: '"opsz" 14' }}>
          <p className="leading-[16px] mb-0">151225 77th Rd N</p>
          <p className="leading-[16px]">Loxahatchee, FL 33470</p>
        </div>
      </div>
      <span className="text-[#262630]"><IconChevronDown /></span>
    </div>
  );
}

/* ─── Sidebar ─── */
type Page = "dashboard" | "elections" | "community" | "amenities";
type DashboardView = "homeowner" | "board";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  badge?: number;
  active?: boolean;
  onClick?: () => void;
  uxId: string;
}

function NavItem({ icon, label, badge, active, onClick, uxId }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      data-ux-id={`sidebar-nav-${uxId}`}
      className={`w-full rounded-[8px] flex items-center gap-[12px] pl-[10px] pr-[22px] py-[8px] cursor-pointer transition-colors ${
        active ? "bg-[#e8f1fd]" : "hover:bg-[#f2f6fa]"
      }`}
    >
      <span className={`text-[${active ? "#247ae4" : "#262630"}] flex items-center justify-center size-[24px]`} style={{ color: active ? "#247ae4" : "#262630" }}>
        {icon}
      </span>
      <span
        className={`font-['DM_Sans:Medium',sans-serif] font-medium text-[14px] flex-1 text-left whitespace-nowrap ${active ? "text-[#247ae4]" : "text-[#262630]"}`}
        style={{ fontVariationSettings: '"opsz" 14' }}
      >
        {label}
      </span>
      {badge !== undefined && (
        <span className="bg-[#247ae4] rounded-full min-w-[16px] h-[16px] flex items-center justify-center">
          <span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-white text-[12px] px-[3px]" style={{ fontVariationSettings: '"opsz" 14' }}>
            {badge}
          </span>
        </span>
      )}
    </button>
  );
}

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
  onClose?: () => void;
  onRestart: () => void;
  dashboardView?: DashboardView;
}

function Sidebar({ activePage, onNavigate, onClose, onRestart, dashboardView }: SidebarProps) {
  const [boardActionsOpen, setBoardActionsOpen] = useState(true);
  return (
    <div data-ux-id="sidebar" className="bg-white h-screen md:h-full shrink-0 w-[280px] md:w-[265px] border-r border-[#d9ecf8] flex flex-col overflow-hidden shadow-xl md:shadow-none">
      <div className="flex flex-col gap-[42px] items-center px-[26px] py-[40px] flex-1 overflow-y-auto">
        {/* Mobile close button */}
        <button
          onClick={onClose}
          data-ux-id="sidebar-close-button"
          className="md:hidden self-end -mt-[28px] -mr-[10px] w-[32px] h-[32px] flex items-center justify-center rounded-full text-[#262630] opacity-40 hover:opacity-70 transition-opacity"
          aria-label="Close menu"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
        {/* Branding */}
        <button
          onClick={onRestart}
          data-ux-id="sidebar-logo-restart"
          className="flex flex-col items-center shrink-0 w-[165.907px] cursor-pointer"
          aria-label="Restart prototype"
        >
          <div className="flex flex-col justify-center">
            <svg width="44" height="42" viewBox="0 0 100 92" fill="none">
              <path d="M50 6L6 46h10v42h68V46h10L50 6z" stroke="#1a8ffb" strokeWidth="6" strokeLinejoin="round" strokeLinecap="round" fill="none"/>
              <rect x="38" y="60" width="24" height="28" rx="3" fill="#1a8ffb"/>
              <rect x="68" y="4" width="10" height="22" rx="2" fill="#1a8ffb"/>
            </svg>
          </div>
          <div className="font-['Lexend:Regular',sans-serif] font-normal text-[#043b59] text-[19.514px] tracking-[0.1951px] uppercase mt-1">
            Waterfront
          </div>
          <div className="font-['Lexend:Regular',sans-serif] font-normal text-[#043b59] text-[9.757px] tracking-[-0.1px] uppercase whitespace-nowrap">
            Community Estates
          </div>
        </button>

        {/* Quick Actions */}
        <button data-ux-id="sidebar-quick-actions" className="w-full flex items-center justify-center gap-[10px] px-[23px] py-[12px] rounded-[8px] border border-[#247ae4] hover:bg-[#f0f7ff] transition-colors shrink-0">
          <span className="text-[#247ae4] font-bold text-[14px]">+</span>
          <span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#247ae4] text-[14px]" style={{ fontVariationSettings: '"opsz" 14' }}>
            Quick Actions
          </span>
        </button>

        {/* Nav Items */}
        <div data-ux-id="sidebar-nav-list" className="flex flex-col gap-[13px] w-full shrink-0">
          <NavItem icon={<IconInbox />} label="Inbox" active={false} uxId="inbox" />
          <NavItem icon={<IconHome />} label="Home" active={activePage === "dashboard"} onClick={() => onNavigate("dashboard")} uxId="home" />
          <NavItem icon={<IconPayments />} label="Payments" uxId="payments" />
          <NavItem icon={<IconVote active={activePage === "elections"} />} label="Elections" badge={1} active={activePage === "elections"} onClick={() => onNavigate("elections")} uxId="elections" />
          <NavItem icon={<IconFeed />} label="Community Feed" active={activePage === "community"} onClick={() => onNavigate("community")} uxId="community-feed" />
          {isDemoMode() ? (
            <NavItem
              icon={<IconHome />}
              label="Amenities"
              active={activePage === "amenities"}
              onClick={() => onNavigate("amenities")}
              uxId="amenities"
            />
          ) : null}
          <NavItem icon={<IconRequests />} label="Requests" uxId="requests" />
          <NavItem icon={<IconDocuments />} label="Documents" uxId="documents" />
          <NavItem icon={<IconDirectory />} label="Directory" uxId="directory" />
          <NavItem icon={<IconCalendar />} label="Calendar" uxId="calendar" />

          {/* Board Actions — board member view only */}
          {dashboardView === "board" && <div className="w-full border-t border-[#d9e7f0] my-[9px]" />}
          {dashboardView === "board" && (
            <div className="flex flex-col gap-0 w-full">
              {/* Section header */}
              <button
                type="button"
                onClick={() => setBoardActionsOpen(o => !o)}
                data-ux-id="sidebar-board-actions-toggle"
                className="w-full flex items-center gap-[12px] pl-[10px] pr-[10px] py-[8px] rounded-[8px] hover:bg-[#f2f6fa] transition-colors cursor-pointer"
              >
                <span className="flex items-center justify-center size-[24px] text-[#262630] shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
                  </svg>
                </span>
                <span className="font-['DM_Sans:Medium',sans-serif] font-medium text-[14px] flex-1 text-left text-[#262630]" style={{ fontVariationSettings: '"opsz" 14' }}>
                  Board Actions
                </span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className={`transition-transform duration-200 text-[#9ca3af] shrink-0 ${boardActionsOpen ? "" : "rotate-180"}`}>
                  <path d="M18 15l-6-6-6 6"/>
                </svg>
              </button>

              {/* Sub-items */}
              {boardActionsOpen && (
                <div className="flex flex-col mt-[2px] pl-[22px]">
                  {["ARCs", "Invoices", "Work Orders", "Collections", "Homeowners", "Bank Accounts", "Reports", "Inspections", "Violations", "Board Tasks"].map((item) => (
                    <button
                      key={item}
                      type="button"
                      data-ux-id={`sidebar-board-${item.toLowerCase().replace(/\s+/g, "-")}`}
                      className="w-full text-left px-[10px] py-[7px] text-[13px] font-['DM_Sans:Medium',sans-serif] font-medium text-[#262630] hover:text-[#247ae4] hover:bg-[#f2f6fa] rounded-[6px] transition-colors cursor-pointer"
                      style={{ fontVariationSettings: '"opsz" 14' }}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Divider */}
          <div className="w-full border-t border-[#d9e7f0] my-[9px]" />

          <NavItem icon={<IconProfile />} label="My Profile" uxId="profile" />
          <NavItem icon={<IconLogout />} label="Log Out" onClick={onRestart} uxId="logout" />
        </div>
      </div>
    </div>
  );
}

/* ─── View Toggle ─── */
function ViewToggle({ view, onChange }: { view: DashboardView; onChange: (v: DashboardView) => void }) {
  return (
    <div
      data-ux-id="dashboard-view-toggle"
      className="fixed bottom-6 left-6 z-50 flex items-center bg-[#1a1f2e] rounded-full shadow-[0_4px_24px_rgba(0,0,0,0.35)] p-[5px] gap-[2px]"
    >
      <button
        onClick={() => onChange("homeowner")}
        data-ux-id="dashboard-view-toggle-homeowner"
        className={`flex items-center gap-[8px] px-[16px] py-[9px] rounded-full text-[13px] font-['DM_Sans:SemiBold',sans-serif] font-semibold transition-all cursor-pointer ${
          view === "homeowner" ? "bg-[#2d3550] text-white" : "text-[#8a95ab] hover:text-white"
        }`}
        style={{ fontVariationSettings: '"opsz" 14' }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
        Homeowner
      </button>
      <button
        onClick={() => onChange("board")}
        data-ux-id="dashboard-view-toggle-board"
        className={`flex items-center gap-[8px] px-[16px] py-[9px] rounded-full text-[13px] font-['DM_Sans:SemiBold',sans-serif] font-semibold transition-all cursor-pointer ${
          view === "board" ? "bg-[#2d3550] text-white" : "text-[#8a95ab] hover:text-white"
        }`}
        style={{ fontVariationSettings: '"opsz" 14' }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/>
          <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/>
          <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/>
          <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/>
        </svg>
        Board Member
      </button>
    </div>
  );
}

/* ─── Dashboard Page ─── */
function DashboardPage({ onNavigate, onOpenSidebar, view }: { onNavigate: (page: Page) => void; onOpenSidebar: () => void; view: DashboardView }) {
  return (
    <div data-ux-id="dashboard-page" className="flex-1 min-w-0 h-full overflow-y-auto">
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between px-[16px] py-[14px] bg-white border-b border-[#d9ecf8] shrink-0">
        <button onClick={onOpenSidebar} data-ux-id="dashboard-mobile-menu-button" className="w-[36px] h-[36px] flex items-center justify-center rounded-[8px] hover:bg-[#f0f5fa] transition-colors" aria-label="Open menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M3 12h18M3 18h18" stroke="#262630" strokeWidth="2" strokeLinecap="round"/></svg>
        </button>
        <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[17px]" style={{ fontVariationSettings: '"opsz" 14' }}>Dashboard</p>
        <div className="w-[36px]" />
      </div>

      <div className="flex flex-col gap-[24px] md:gap-[32px] w-full max-w-[1280px] mx-auto pb-[44px] pt-[20px] md:pt-[31px] px-[16px] md:px-[44px] min-w-0">
        {/* Header — desktop only */}
        <div className="hidden md:flex items-center justify-between w-full shrink-0">
          <div className="flex flex-col flex-1 min-w-0">
            <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[28px] leading-normal" style={{ fontVariationSettings: '"opsz" 14' }}>
              Dashboard
            </p>
            <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] opacity-70 text-[16px] leading-normal" style={{ fontVariationSettings: '"opsz" 14' }}>
              The latest and greatest from your community
            </p>
          </div>
          <AddressCard />
        </div>

        {/* Election Alert Banner */}
        <div data-ux-id="election-banner" className="bg-white rounded-[14px] md:rounded-[18px] shadow-[0px_2px_18px_0px_rgba(18,17,48,0.07)] w-full shrink-0 flex items-center">
          <div className="flex gap-[10px] items-start md:items-center px-[16px] md:px-[26px] py-[14px] md:py-[20px] w-full">
            <span className="text-[#247ae4] shrink-0 mt-[2px] md:mt-0"><IconBell width={14} height={14} /></span>
            <p className="flex-1 font-['DM_Sans:Regular',sans-serif] font-normal text-[14px] md:text-[15px] min-w-0 leading-snug" style={{ fontVariationSettings: '"opsz" 14' }}>
              <span className="text-[#262630]">You have </span>
              <span>a upcoming board election. Go to the </span>
              <button onClick={() => onNavigate("elections")} data-ux-id="election-banner-link" className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#247ae4] underline underline-offset-2 cursor-pointer" style={{ fontVariationSettings: '"opsz" 14' }}>Elections</button>
              {" "}
              <span>page to submit your vote.</span>
            </p>
          </div>
        </div>

        {/* Board Actions widget — board member view only */}
        {view === "board" && <BoardTasksWidget />}

        {/* Payments + Transactions row */}
        <div className="flex flex-col md:flex-row gap-[20px] md:gap-[32px] w-full shrink-0">
          {/* Payments widget */}
          <div data-ux-id="payments-widget" className="bg-white rounded-[18px] border border-[#d9e7f0] drop-shadow-[0px_2px_9px_rgba(18,17,48,0.07)] flex-1 min-w-0">
            <div className="flex flex-col gap-[14px] pb-[18px] pt-[20px] md:pt-[24px] px-[16px] md:px-[26px]">
              <div className="flex items-center justify-between w-full gap-[8px]">
                <p className="flex-1 font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[20px] leading-normal min-w-0" style={{ fontVariationSettings: '"opsz" 14' }}>Payments</p>
                <div className="flex gap-[6px] items-center text-right shrink-0">
                  <p className="font-['DM_Sans:Medium',sans-serif] font-medium text-[13px] md:text-[15px] whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>Account #: 4329980</p>
                  <span className="text-[14px]"><IconChevronDown /></span>
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-[16px] md:gap-[22px] w-full">
                <div className="flex flex-row md:flex-col gap-[20px] md:gap-[20px] flex-1 min-w-0 justify-between md:justify-start">
                  <div>
                    <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[28px] md:text-[34px] leading-normal" style={{ fontVariationSettings: '"opsz" 14' }}>$2,911.14</p>
                    <div className="flex gap-[4px] items-center text-[14px]">
                      <p className="font-['DM_Sans:Regular',sans-serif] font-normal opacity-62 text-[#262630] text-[13px] md:text-[14px]" style={{ fontVariationSettings: '"opsz" 14' }}>Current Balance</p>
                      <span className="text-[#262630]"><IconQuestion /></span>
                    </div>
                  </div>
                  <div>
                    <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[22px] md:text-[24px] leading-normal" style={{ fontVariationSettings: '"opsz" 14' }}>$0.00</p>
                    <div className="flex gap-[4px] items-center text-[14px]">
                      <p className="font-['DM_Sans:Regular',sans-serif] font-normal opacity-62 text-[#262630] text-[13px] md:text-[14px]" style={{ fontVariationSettings: '"opsz" 14' }}>Upcoming Charges</p>
                      <span className="text-[#262630]"><IconQuestion /></span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-[12px] md:gap-[22px] md:items-end pb-0 md:pb-[11px] md:pt-[14px] md:shrink-0">
                  <button data-ux-id="payments-make-payment-button" className="bg-[#247ae4] flex items-center justify-center px-[24px] py-[10px] rounded-[8px] hover:bg-[#1a6ed0] transition-colors w-full md:w-auto">
                    <span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-white text-[16px] text-center whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>Make a Payment</span>
                  </button>
                  <div className="flex flex-row md:flex-col gap-[16px] md:gap-[10px] md:items-end items-center">
                    <div className="flex gap-[7px] items-center">
                      <div data-ux-id="payments-autopay-toggle" className="bg-[#b8bec5] rounded-[8px] w-[34px] h-[18px] flex items-center px-[2px] shrink-0">
                        <div className="bg-white rounded-[6px] w-[14px] h-[14px]" />
                      </div>
                      <span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[13px] md:text-[14px] whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>Enroll in AutoPay</span>
                    </div>
                    <p data-ux-id="payments-manage-payments-link" className="font-['DM_Sans:Medium',sans-serif] font-medium text-[#247ae4] text-[13px] md:text-[14px] whitespace-nowrap cursor-pointer hover:underline" style={{ fontVariationSettings: '"opsz" 14' }}>Manage payments</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Transactions widget */}
          <div data-ux-id="transactions-widget" className="bg-white rounded-[18px] drop-shadow-[0px_2px_9px_rgba(18,17,48,0.07)] flex-1 min-w-0">
            <div className="flex flex-col gap-[24px] px-[16px] md:px-[26px] py-[20px] md:py-[24px]">
              <div className="flex gap-[14px] items-start w-full">
                <p className="flex-1 font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[20px] leading-normal min-w-0" style={{ fontVariationSettings: '"opsz" 14' }}>Recent Transactions</p>
                <div data-ux-id="transactions-view-all-link" className="flex gap-[7px] items-center text-[#0d5bba] text-[14px] whitespace-nowrap cursor-pointer">
                  <span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold" style={{ fontVariationSettings: '"opsz" 14' }}>View All</span>
                  <IconChevronRight />
                </div>
              </div>
              <div className="w-full flex flex-col gap-[11px]">
                {[
                  { date: "Jan 5, 2026", desc: "Annual HOA Fee", amount: "$649.34" },
                  { date: "Dec 5, 2025", desc: "Monthly HOA Fee", amount: "$425.00" },
                  { date: "Nov 5, 2025", desc: "Monthly HOA Fee", amount: "$425.00" },
                ].map((tx, i) => (
                  <div key={i} data-ux-id={`transactions-row-${tx.date.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>
                    <div className="flex gap-[22px] items-center w-full">
                      <div className="flex items-start opacity-65 w-[70px] shrink-0">
                        <p className="font-['DM_Sans:Medium',sans-serif] font-medium text-[#262630] text-[12px] leading-normal whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>{tx.date}</p>
                      </div>
                      <p className="flex-1 font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[15px] leading-normal min-w-0" style={{ fontVariationSettings: '"opsz" 14' }}>{tx.desc}</p>
                      <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] text-[13px] w-[32px]" style={{ fontVariationSettings: '"opsz" 14' }}>PAID</p>
                      <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[16px] text-right whitespace-nowrap w-[67px]" style={{ fontVariationSettings: '"opsz" 14' }}>{tx.amount}</p>
                    </div>
                    {i < 2 && <div className="bg-[#d9d9d9] h-px w-full mt-[11px]" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Community Feed widget */}
        <div data-ux-id="dashboard-community-feed-widget" className="bg-white rounded-[18px] drop-shadow-[0px_2px_9px_rgba(18,17,48,0.07)] w-full shrink-0">
          <div className="flex flex-col gap-[18px] md:gap-[22px] px-[16px] md:px-[26px] py-[20px] md:py-[24px]">
            <div className="flex gap-[14px] items-center w-full">
              <p className="flex-1 font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[20px] leading-normal min-w-0" style={{ fontVariationSettings: '"opsz" 14' }}>Community Feed</p>
              <button onClick={() => onNavigate("community")} data-ux-id="dashboard-community-feed-view-all-link" className="flex gap-[7px] items-center text-[#0d5bba] text-[14px] whitespace-nowrap cursor-pointer">
                <span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold" style={{ fontVariationSettings: '"opsz" 14' }}>View All Posts</span>
                <IconChevronRight />
              </button>
            </div>
            <div className="flex flex-col gap-[18px] md:gap-[22px]">
              {initialCommunityPosts
                .filter((post) => post.image && post.links && post.links.length > 0)
                .slice(0, 2)
                .map((post, i, arr) => (
                  <div key={post.id}>
                    <div data-ux-id={`dashboard-community-feed-post-${post.id}`} className="flex gap-[14px] md:gap-[18px] items-start w-full">
                      <img
                        src={post.image}
                        alt={post.imageAlt ?? ""}
                        className="w-[120px] h-[90px] md:w-[160px] md:h-[110px] rounded-[12px] object-cover shrink-0"
                      />
                      <div className="flex flex-col gap-[6px] min-w-0 flex-1">
                        <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[15px] leading-[1.25]" style={{ fontVariationSettings: '"opsz" 14' }}>
                          {post.title}
                        </p>
                        <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] opacity-65 text-[13px] leading-[1.4] line-clamp-2" style={{ fontVariationSettings: '"opsz" 14' }}>
                          {post.body}
                        </p>
                        {post.links && post.links.length > 0 && (
                          <div className="flex flex-wrap gap-[7px] mt-[2px]">
                            {post.links.map((link, linkIdx) => (
                              <a
                                key={link.href}
                                href={link.href}
                                target="_blank"
                                rel="noreferrer"
                                data-ux-id={`dashboard-community-feed-post-${post.id}-link-${linkIdx}`}
                                className="max-w-full truncate rounded-full bg-[#e8f1f6] px-[12px] py-[5px] font-['DM_Sans:SemiBold',sans-serif] text-[12px] font-semibold leading-[1.2] text-[#262630] transition-colors hover:bg-[#d9eaf3] hover:text-[#247ae4]"
                              >
                                {link.label}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    {i < arr.length - 1 && <div className="bg-[#d9d9d9] h-px w-full mt-[18px] md:mt-[22px]" />}
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Inbox widget */}
        <div data-ux-id="inbox-widget" className="bg-white rounded-[18px] drop-shadow-[0px_2px_9px_rgba(18,17,48,0.07)] w-full shrink-0">
          <div className="flex flex-col gap-[20px] md:gap-[24px] px-[16px] md:px-[26px] py-[20px] md:py-[24px]">
            <div className="flex gap-[14px] items-center w-full">
              <p className="flex-1 font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[20px] leading-normal min-w-0" style={{ fontVariationSettings: '"opsz" 14' }}>Inbox</p>
              <div data-ux-id="inbox-view-all-link" className="flex gap-[7px] items-center text-[#0d5bba] text-[14px] whitespace-nowrap cursor-pointer">
                <span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold" style={{ fontVariationSettings: '"opsz" 14' }}>View All</span>
                <IconChevronRight />
              </div>
            </div>
            {/* Filter chips */}
            <div className="flex flex-wrap gap-[9px] items-center">
              <div data-ux-id="inbox-filter-all" className="bg-[#247ae4] rounded-[50px] flex items-center gap-[10px] pl-[15px] pr-[7px] py-[8px]">
                <span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-white text-[14px] whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>All</span>
                <div className="bg-[rgba(255,255,255,0.3)] rounded-[50px] size-[19px] flex items-center justify-center">
                  <span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-white text-[13px]" style={{ fontVariationSettings: '"opsz" 14' }}>21</span>
                </div>
              </div>
              <div data-ux-id="inbox-filter-needs-attention" className="bg-[#fff0dd] rounded-[50px] flex items-center gap-[10px] pl-[15px] pr-[7px] py-[8px]">
                <span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[14px] whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>Needs Attention</span>
                <div className="bg-[#f17d11] rounded-[50px] size-[19px] flex items-center justify-center">
                  <span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-white text-[13px]" style={{ fontVariationSettings: '"opsz" 14' }}>3</span>
                </div>
              </div>
              <div data-ux-id="inbox-filter-announcements" className="bg-[#dfeaf0] rounded-[50px] flex items-center gap-[10px] pl-[15px] pr-[7px] py-[8px]">
                <span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[14px] whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>Announcements</span>
                <div className="bg-white rounded-[50px] size-[19px] flex items-center justify-center">
                  <span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[13px]" style={{ fontVariationSettings: '"opsz" 14' }}>5</span>
                </div>
              </div>
              <div data-ux-id="inbox-filter-messages" className="bg-[#dfeaf0] rounded-[50px] flex items-center gap-[10px] pl-[15px] pr-[7px] py-[8px]">
                <span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[14px] whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>Messages</span>
                <div className="bg-white rounded-[50px] size-[19px] flex items-center justify-center">
                  <span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[13px]" style={{ fontVariationSettings: '"opsz" 14' }}>3</span>
                </div>
              </div>
            </div>
            {/* Inbox rows */}
            <div className="w-full border-t border-[#d9d9d9]">
              {[
                { unread: true, type: "Reminder", title: "Pool Party This Weekend!", preview: "Join us this Saturday for a splashin' good time at the community pool. The fun begins", tag: "Open", tagBg: "#d9ebfa", date: "July 6" },
                { unread: false, type: "ARC Request", title: "Request received", preview: "We are reviewing your recent request and will be in touch shortly. Please have all", tag: "Updated", tagBg: "#d9ebfa", date: "July 1" },
                { unread: true, type: "Alert", title: "Landscaping Schedule", preview: "The landscaping crew will be on site next Tuesday for regular maintenance. Please keep all pets indoors", tag: "Scheduled", tagBg: "transparent", date: "July 9" },
                { unread: true, type: "Heads Up", title: "Package Delivery Changes", preview: "Effective immediately, all packages will be delivered to the front office. Please pick them up within 48 hours", tag: "Updated", tagBg: "transparent", date: "July 8" },
                { unread: false, type: "Reminder", title: "Board Meeting Next Week", preview: "The next board meeting is scheduled for next Wednesday at 7 PM in the clubhouse. All residents are welcome", tag: "Scheduled", tagBg: "#d9ebfa", date: "July 7" },
              ].map((msg, i) => (
                <div key={i} data-ux-id={`inbox-row-${msg.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`} className="border-b border-[#d9d9d9] flex items-center cursor-pointer hover:bg-[#f9fbfd]">
                  <div className="flex gap-[12px] md:gap-[29px] items-center px-[14px] md:px-[22px] py-[12px] md:py-[14px] w-full">
                    <div className="shrink-0 size-[8px]">
                      {msg.unread && (
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                          <circle cx="4" cy="4" r="4" fill="#247AE4"/>
                        </svg>
                      )}
                    </div>
                    <p
                      className={`text-[13px] md:text-[14px] w-[80px] md:w-[120px] shrink-0 ${msg.unread ? "font-['DM_Sans:Medium',sans-serif] font-medium" : "font-['DM_Sans:Regular',sans-serif] font-normal opacity-70"}`}
                      style={{ fontVariationSettings: '"opsz" 14' }}
                    >
                      {msg.type}
                    </p>
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className="flex gap-[3px] items-center text-[14px] whitespace-nowrap overflow-hidden">
                        <span
                          className={`shrink-0 ${msg.unread ? "font-['DM_Sans:Bold',sans-serif] font-bold" : "font-['DM_Sans:Regular',sans-serif] font-normal opacity-70"}`}
                          style={{ fontVariationSettings: '"opsz" 14' }}
                        >
                          {msg.title}
                        </span>
                        <span className="opacity-70 overflow-hidden text-ellipsis flex-1 min-w-0 font-['DM_Sans:Regular',sans-serif]" style={{ fontVariationSettings: '"opsz" 14' }}>
                          {" -- "}{msg.preview}
                        </span>
                      </div>
                    </div>
                    <div className="hidden md:flex shrink-0 w-[80px] items-center justify-end">
                      {msg.tagBg !== "transparent" ? (
                        <div className="rounded-[50px] px-[10px] py-[2px]" style={{ backgroundColor: msg.tagBg }}>
                          <span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[13px] whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>{msg.tag}</span>
                        </div>
                      ) : (
                        <span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[13px] whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>{msg.tag}</span>
                      )}
                    </div>
                    <p
                      className={`hidden md:block text-[14px] w-[50px] shrink-0 ${msg.unread ? "font-['DM_Sans:Bold',sans-serif] font-bold" : "font-['DM_Sans:Regular',sans-serif] font-normal opacity-70"}`}
                      style={{ fontVariationSettings: '"opsz" 14' }}
                    >
                      {msg.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Completed Election Results Card ─── */
function CompletedElectionCard({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const results = {
    title: "2025 Board of Directors Election",
    votingPeriod: "Aug 28 – Sep 15, 2026",
    certifiedDate: "September 17, 2025",
    quorum: { required: 86, achieved: 143, total: 214 },
    ballotsTotal: 143,
    ballotsRejected: 4,
    ballotsValid: 139,
    turnoutPct: 67,
    elected: [
      { name: "Patricia Nguyen", initials: "PN", color: "#247ae4", votes: 118, votePct: 85, role: "Board Director — 2-year term" },
      { name: "Robert Castillo", initials: "RC", color: "#1b8c5a", votes: 97, votePct: 70, role: "Board Director — 2-year term" },
    ],
    runners: [
      { name: "Angela Morrison", initials: "AM", color: "#9b59b6", votes: 62, votePct: 45 },
      { name: "David Park", initials: "DP", color: "#e67e22", votes: 41, votePct: 30 },
    ],
    committee: {
      name: "Waterfront Community Estates Elections Committee",
      members: ["Linda Farrow, Chair", "James Tran", "Priya Mehta"],
      statement: "We, the undersigned members of the Elections Committee, certify that this election was conducted in accordance with the Association's Bylaws and Florida Statute §720. All ballots were verified, counted, and tabulated under independent oversight. The results above are true and accurate to the best of our knowledge.",
    },
  };

  return (
    <div data-ux-id="election-results-card" className="w-full bg-white rounded-[18px] border border-[#d9e7f0] drop-shadow-[0px_2px_9px_rgba(18,17,48,0.07)] shrink-0">
      <div className={`px-[16px] md:px-[26px] pt-[20px] md:pt-[24px] flex flex-col gap-[20px] md:gap-[24px] ${collapsed ? "pb-[20px] md:pb-[24px]" : "pb-[24px] md:pb-[28px]"}`}>

        {/* Header */}
        <div className="flex flex-col gap-[6px]">
          <div className="flex items-center gap-[10px]">
            <span className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] opacity-60 text-[13px]" style={{ fontVariationSettings: '"opsz" 14' }}>
              Voting period {results.votingPeriod}
            </span>
            <div className="bg-[#dfeaf0] rounded-[50px] px-[12px] py-[5px] flex items-center shrink-0">
              <span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[13px] leading-[19.5px] whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>Closed</span>
            </div>
          </div>
          <div className="flex items-start justify-between gap-[12px]">
            <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[20px] leading-normal flex-1 min-w-0" style={{ fontVariationSettings: '"opsz" 14' }}>
              {results.title}
            </p>
            <CollapseButton collapsed={collapsed} onToggle={onToggle} uxId="election-results-collapse-button" />
          </div>
          {!collapsed && (
            <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] opacity-65 text-[14px]" style={{ fontVariationSettings: '"opsz" 14' }}>
              Official results certified {results.certifiedDate}. Two board seats were contested by four candidates.
            </p>
          )}
        </div>

        {/* Summary stats row */}
        {!collapsed && <div className="grid grid-cols-2 md:grid-cols-4 gap-[12px]">
          {[
            {
              label: "Ballots Cast", value: results.ballotsTotal.toString(), sub: `${results.turnoutPct}% turnout`,
              icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 12l2 2 4-4M7 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-2M9 4h6a1 1 0 010 2H9a1 1 0 010-2z" stroke="#247ae4" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/></svg>,
            },
            {
              label: "Valid Ballots", value: results.ballotsValid.toString(), sub: `${results.ballotsRejected} rejected`,
              icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#1b8c5a" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/></svg>,
            },
            {
              label: "Quorum", value: "Met", sub: `${results.quorum.achieved} of ${results.quorum.required} required`,
              icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="#7c3aed" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/></svg>,
            },
            {
              label: "Total Units", value: results.quorum.total.toString(), sub: "eligible voters",
              icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="#ea8c1e" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 22V12h6v10" stroke="#ea8c1e" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/></svg>,
            },
          ].map((stat) => (
            <div key={stat.label} data-ux-id={`election-results-stat-${stat.label.toLowerCase().replace(/\s+/g, "-")}`} className="bg-[#f8fafc] rounded-[12px] px-[16px] py-[14px] flex flex-col gap-[4px]">
              <div className="flex items-center gap-[6px] mb-[2px]">
                <span className="opacity-80">{stat.icon}</span>
                <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] opacity-55 text-[11px] uppercase tracking-wide" style={{ fontVariationSettings: '"opsz" 14' }}>{stat.label}</p>
              </div>
              <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[22px] leading-tight" style={{ fontVariationSettings: '"opsz" 14' }}>{stat.value}</p>
              <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] opacity-50 text-[12px]" style={{ fontVariationSettings: '"opsz" 14' }}>{stat.sub}</p>
            </div>
          ))}
        </div>}

        {/* Quorum status bar */}
        {!collapsed && <div className="flex flex-col gap-[8px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-[8px]">
              <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[13px]" style={{ fontVariationSettings: '"opsz" 14' }}>Quorum Status</p>
              <div className="flex items-center gap-[5px] bg-[#dcfce7] rounded-[50px] px-[9px] py-[3px]">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#166534] text-[11px]" style={{ fontVariationSettings: '"opsz" 14' }}>Achieved</span>
              </div>
            </div>
            <p className="hidden md:block font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] opacity-60 text-[13px]" style={{ fontVariationSettings: '"opsz" 14' }}>
              <span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] opacity-100">{results.quorum.achieved}</span> ballots · {results.quorum.required} minimum required
            </p>
          </div>
          <div className="w-full h-[8px] bg-[#e8eff5] rounded-full overflow-hidden">
            <div className="h-full bg-[#1b8c5a] rounded-full" style={{ width: `${Math.round((results.quorum.achieved / results.quorum.total) * 100)}%` }} />
          </div>

          <p className="md:hidden font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] opacity-60 text-[13px]" style={{ fontVariationSettings: '"opsz" 14' }}>
            <span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] opacity-100">{results.quorum.achieved}</span> ballots · {results.quorum.required} minimum required
          </p>
        </div>}

        {/* Elected candidates — full row, 2 cards */}
        {!collapsed && <div className="flex flex-col gap-[10px]">
          <div className="flex items-center gap-[8px]">
            <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[13px]" style={{ fontVariationSettings: '"opsz" 14' }}>Elected Candidates</p>
            <span className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] opacity-45 text-[13px]" style={{ fontVariationSettings: '"opsz" 14' }}>— 2 seats</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[12px]">
            {results.elected.map((c) => (
              <div key={c.name} data-ux-id={`election-results-elected-${c.name.toLowerCase().replace(/\s+/g, "-")}`} className="border border-[#bbf7d0] bg-[#f0fdf4] rounded-[14px] px-[16px] py-[14px] flex flex-col gap-[10px]">
                <div className="flex items-center gap-[12px]">
                  <div className="w-[36px] h-[36px] rounded-full flex items-center justify-center shrink-0 text-white font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[13px]" style={{ backgroundColor: c.color, fontVariationSettings: '"opsz" 14' }}>
                    {c.initials}
                  </div>
                  <div className="flex flex-col gap-[1px] flex-1 min-w-0">
                    <div className="flex items-center gap-[6px]">
                      <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[14px]" style={{ fontVariationSettings: '"opsz" 14' }}>{c.name}</p>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#16a34a"/><path d="M7 12.5l3.5 3.5 6-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#166534] opacity-80 text-[11px]" style={{ fontVariationSettings: '"opsz" 14' }}>{c.role}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-[4px]">
                  <div className="flex items-center justify-between">
                    <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[16px]" style={{ fontVariationSettings: '"opsz" 14' }}>{c.votes} <span className="text-[12px] font-normal opacity-55">votes</span></p>
                    <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#1b8c5a] text-[11px]" style={{ fontVariationSettings: '"opsz" 14' }}>{c.votePct}%</p>
                  </div>
                  <div className="w-full h-[6px] bg-[#d1fae5] rounded-full overflow-hidden">
                    <div className="h-full bg-[#16a34a] rounded-full" style={{ width: `${c.votePct}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>}

        {/* Other candidates — full row, 2 cards */}
        {!collapsed && <div className="flex flex-col gap-[10px]">
          <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[13px]" style={{ fontVariationSettings: '"opsz" 14' }}>Other Candidates</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[12px]">
            {results.runners.map((c) => (
              <div key={c.name} data-ux-id={`election-results-runner-${c.name.toLowerCase().replace(/\s+/g, "-")}`} className="border border-[#e8eff5] bg-white rounded-[12px] px-[16px] py-[14px] flex flex-col gap-[10px]">
                <div className="flex items-center gap-[12px]">
                  <div className="w-[36px] h-[36px] rounded-full flex items-center justify-center shrink-0 text-white font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[13px] opacity-60" style={{ backgroundColor: c.color, fontVariationSettings: '"opsz" 14' }}>
                    {c.initials}
                  </div>
                  <p className="font-['DM_Sans:Medium',sans-serif] font-medium text-[#262630] opacity-70 text-[14px] flex-1 min-w-0" style={{ fontVariationSettings: '"opsz" 14' }}>{c.name}</p>
                </div>
                <div className="flex flex-col gap-[4px]">
                  <div className="flex items-center justify-between">
                    <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] opacity-60 text-[16px]" style={{ fontVariationSettings: '"opsz" 14' }}>{c.votes} <span className="text-[12px] font-normal opacity-70">votes</span></p>
                    <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] opacity-40 text-[11px]" style={{ fontVariationSettings: '"opsz" 14' }}>{c.votePct}%</p>
                  </div>
                  <div className="w-full h-[5px] bg-[#e8eff5] rounded-full overflow-hidden">
                    <div className="h-full bg-[#94a3b8] rounded-full" style={{ width: `${c.votePct}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>}

        {/* Ballot breakdown */}
        {!collapsed && <div className="border border-[#e8eff5] rounded-[14px] px-[20px] py-[16px] flex flex-col gap-[10px]">
          <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[13px]" style={{ fontVariationSettings: '"opsz" 14' }}>Ballot Summary</p>
          <div className="flex flex-col gap-[6px]">
            {[
              { label: "Total ballots cast", value: results.ballotsTotal, highlight: false },
              { label: "Valid ballots counted", value: results.ballotsValid, highlight: false },
              { label: "Rejected / invalid ballots", value: results.ballotsRejected, highlight: true },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between py-[6px] border-b border-[#f1f5f9] last:border-0">
                <p className={`font-['DM_Sans:Regular',sans-serif] font-normal text-[14px] ${row.highlight ? "text-[#b45309]" : "text-[#262630] opacity-70"}`} style={{ fontVariationSettings: '"opsz" 14' }}>{row.label}</p>
                <p className={`font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[14px] ${row.highlight ? "text-[#b45309]" : "text-[#262630]"}`} style={{ fontVariationSettings: '"opsz" 14' }}>{row.value}</p>
              </div>
            ))}
          </div>
          {results.ballotsRejected > 0 && (
            <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#b45309] opacity-80 text-[12px] leading-[1.5]" style={{ fontVariationSettings: '"opsz" 14' }}>
              {results.ballotsRejected} ballots were rejected due to missing signatures or non-matching unit numbers and were not included in the final tally.
            </p>
          )}
        </div>}

        {/* Elections committee certification */}
        {!collapsed && <div className="border border-[#e2eaf0] rounded-[14px] px-[20px] py-[18px] flex flex-col gap-[14px] bg-[#fafcfe]">
          <div className="flex items-start gap-[12px]">
            <div className="w-[34px] h-[34px] rounded-full bg-[#e8f1fd] flex items-center justify-center shrink-0 mt-[1px]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#247ae4" strokeWidth="1.8" strokeLinejoin="round"/>
                <path d="M9 12l2 2 4-4" stroke="#247ae4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="flex flex-col gap-[2px] min-w-0">
              <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[14px]" style={{ fontVariationSettings: '"opsz" 14' }}>{results.committee.name}</p>
              <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] opacity-55 text-[12px]" style={{ fontVariationSettings: '"opsz" 14' }}>Certification of Election Results</p>
            </div>
          </div>
          <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] opacity-70 text-[13px] leading-[1.65]" style={{ fontVariationSettings: '"opsz" 14' }}>
            {results.committee.statement}
          </p>
          <div className="flex flex-wrap gap-[24px] pt-[16px] border-t border-[#e2eaf0]">
            {results.committee.members.map((member) => (
              <div key={member} className="flex flex-col gap-[6px]">
                <p className="font-['DM_Sans:Medium',sans-serif] font-medium text-[#262630] opacity-60 text-[12px]" style={{ fontVariationSettings: '"opsz" 14' }}>{member}</p>
              </div>
            ))}
          </div>
          <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] opacity-40 text-[11px]" style={{ fontVariationSettings: '"opsz" 14' }}>
            Certified {results.certifiedDate} · Waterfront Community Estates, Loxahatchee, FL 33470
          </p>
        </div>}

      </div>
    </div>
  );
}

/* ─── Elections Page ─── */
type CampaignType = "board" | "bylaw" | "budget";
interface Campaign {
  id: string;
  type: CampaignType;
  title: string;
  description: string;
  votingPeriod: string;
  closesDate: string;
  status: "open" | "upcoming" | "closed";
  candidates?: { name: string; role: string; bio: string; initials: string; color: string }[];
  options?: { label: string; description: string }[];
  participation?: { voted: number; total: number };
}

const campaigns: Campaign[] = [
  {
    id: "board-2026",
    type: "board",
    title: "2026 Board of Directors Election",
    description: "4 nominees for 2 board positions. Results will be announced at the September 20th Annual Meeting.",
    votingPeriod: "Aug 28 – Sep 15, 2026",
    closesDate: "Sep 15, 2026",
    status: "open",
    participation: { voted: 87, total: 214 },
    candidates: [
      { name: "Patricia Nguyen", role: "Current Treasurer", bio: "15-year resident with a background in corporate finance. Advocates for transparent budgeting and long-term reserve planning.", initials: "PN", color: "#247ae4" },
      { name: "Robert Castillo", role: "Resident since 2009", bio: "Retired civil engineer passionate about infrastructure improvements, green spaces, and community safety initiatives.", initials: "RC", color: "#1b8c5a" },
      { name: "Angela Morrison", role: "Current Secretary", bio: "Communications professional who has led the community newsletter and digital outreach efforts for three years.", initials: "AM", color: "#9b59b6" },
      { name: "David Park", role: "Resident since 2017", bio: "Software architect and HOA committee volunteer. Interested in modernizing community operations and digital systems.", initials: "DP", color: "#e67e22" },
    ],
  },
  {
    id: "bylaw-2026",
    type: "bylaw",
    title: "Bylaw Amendment — Short-Term Rental Restrictions",
    description: "Proposed amendment to Article VII, Section 4 to prohibit rentals shorter than 30 days and require HOA registration for all rental units.",
    votingPeriod: "Sep 16 – Oct 1, 2026",
    closesDate: "Oct 1, 2026",
    status: "upcoming",
    options: [
      { label: "Yes — Approve the amendment", description: "Adopt the 30-day minimum rental restriction and registration requirement as proposed." },
      { label: "No — Reject the amendment", description: "Keep the existing bylaw language with no changes to rental restrictions." },
    ],
  },
  {
    id: "budget-2026",
    type: "budget",
    title: "FY 2027 Budget Ratification Vote",
    description: "Homeowners vote to ratify the proposed $1.2M operating budget, including a 4.5% assessment increase effective January 1, 2027.",
    votingPeriod: "Oct 5 – Oct 20, 2026",
    closesDate: "Oct 20, 2026",
    status: "upcoming",
    options: [
      { label: "Approve the FY 2027 budget", description: "Ratify the proposed budget including the 4.5% assessment increase." },
      { label: "Reject the FY 2027 budget", description: "Send the budget back to the board for revision before a second vote." },
    ],
  },
];

function CollapseButton({ collapsed, onToggle, uxId = "collapse-button" }: { collapsed: boolean; onToggle: () => void; uxId?: string }) {
  return (
    <button
      onClick={onToggle}
      data-ux-id={uxId}
      className="shrink-0 w-[36px] h-[36px] rounded-full flex items-center justify-center text-[#262630] opacity-35 hover:opacity-70 hover:bg-[#f0f5fa] transition-all"
      aria-label={collapsed ? "Expand section" : "Collapse section"}
    >
      <svg
        width="22" height="22" viewBox="0 0 24 24" fill="none"
        className="transition-transform duration-200"
        style={{ transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)" }}
      >
        <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );
}

function ParticipationBar({ voted, total, uxId = "participation-bar" }: { voted: number; total: number; uxId?: string }) {
  const pct = Math.round((voted / total) * 100);
  return (
    <div data-ux-id={uxId} className="flex flex-col gap-[8px]">
      <div className="flex items-center justify-between">
        <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] text-[13px]" style={{ fontVariationSettings: '"opsz" 14' }}>
          <span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[16px]">{voted}</span>{" of "}{total}{" units voted · "}<span className="text-[#247ae4]">{pct}%</span>
        </p>
        <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] text-[13px]" style={{ fontVariationSettings: '"opsz" 14' }}>
          {"Quorum: 50% (107 units)"}
        </p>
      </div>
      <div className="w-full h-[8px] bg-[#e8eff5] rounded-full overflow-hidden">
        <div className="h-full bg-[#247ae4] rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function ElectionsPage({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const [ballotSent, setBallotSent] = useState(false);
  const [consentNotices, setConsentNotices] = useState(false);
  const [consentVoting, setConsentVoting] = useState(false);
  const [consentSaved, setConsentSaved] = useState(false);
  const [consentBannerDismissed, setConsentBannerDismissed] = useState(false);
  const [collapsedCards, setCollapsedCards] = useState<Set<string>>(new Set());

  const toggleCard = (id: string) =>
    setCollapsedCards((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const [activeTab, setActiveTab] = useState<"nominations" | "proxy" | "results">("proxy");
  const [showConsentModal, setShowConsentModal] = useState(!consentSaved);
  const daysLeft = 5;

  const tabs: { id: typeof activeTab; label: string }[] = [
    { id: "nominations", label: "Nominations" },
    { id: "proxy", label: "Voting / Campaigns" },
    { id: "results", label: "Results" },
  ];

  return (
    <div data-ux-id="elections-page" className="flex-1 min-w-0 h-full overflow-y-auto">
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between px-[16px] py-[14px] bg-white border-b border-[#d9ecf8] shrink-0">
        <button onClick={onOpenSidebar} data-ux-id="elections-mobile-menu-button" className="w-[36px] h-[36px] flex items-center justify-center rounded-[8px] hover:bg-[#f0f5fa] transition-colors" aria-label="Open menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M3 12h18M3 18h18" stroke="#262630" strokeWidth="2" strokeLinecap="round"/></svg>
        </button>
        <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[17px]" style={{ fontVariationSettings: '"opsz" 14' }}>Governance</p>
        <div className="w-[36px]" />
      </div>

      <div className="flex flex-col gap-[24px] md:gap-[32px] w-full max-w-[1280px] mx-auto pb-[44px] pt-[20px] md:pt-[31px] px-[16px] md:px-[44px] min-w-0 rounded-[6px]">

        {/* Header — desktop only */}
        <div className="hidden md:flex items-center justify-between w-full shrink-0">
          <div className="flex flex-col flex-1 min-w-0">
            <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[28px] leading-normal" style={{ fontVariationSettings: '"opsz" 14' }}>
              Elections
            </p>
            <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] opacity-70 text-[16px] leading-normal" style={{ fontVariationSettings: '"opsz" 14' }}>
              Cast your vote and make your voice heard in the community
            </p>
          </div>
          <AddressCard />
        </div>


        {/* Electronic Consent modal */}
        {showConsentModal && (
          <div
            data-ux-id="elections-consent-modal-backdrop"
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px] px-[16px]"
          >
            <div data-ux-id="elections-consent-modal" className="w-full max-w-[560px] bg-white rounded-[20px] shadow-[0_8px_40px_rgba(0,0,0,0.18)] flex flex-col gap-[0px] overflow-hidden">
              {/* Modal header */}
              <div className="px-[28px] pt-[26px] pb-[20px] flex flex-col gap-[2px]">
                <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[17px]" style={{ fontVariationSettings: '"opsz" 14' }}>
                  Upcoming – 2026 Board of Directors Election
                </p>
                <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] opacity-55 text-[13px]" style={{ fontVariationSettings: '"opsz" 14' }}>
                  Voting open Aug 28 – Sep 15, 2026
                </p>
              </div>
              <div className="w-full h-px bg-[#e2eaf0]" />
              {/* Modal body */}
              <div className="px-[28px] py-[22px] flex flex-col gap-[18px]">
                <div className="flex flex-col gap-[4px]">
                  <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[16px]" style={{ fontVariationSettings: '"opsz" 14' }}>
                    Electronic Consent
                  </p>
                  <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] opacity-60 text-[13px]" style={{ fontVariationSettings: '"opsz" 14' }}>
                    Your association requires consent to send election notices and accept votes electronically.
                  </p>
                  <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[12px] uppercase tracking-wide mt-[6px]" style={{ fontVariationSettings: '"opsz" 14' }}>
                    Review &amp; Agree
                  </p>
                </div>

                <div className="flex flex-col gap-[14px]">
                  <label className="flex items-start gap-[14px] cursor-pointer group">
                    <div
                      onClick={() => setConsentNotices(v => !v)}
                      data-ux-id="elections-consent-notices-checkbox"
                      className={`mt-[1px] w-[20px] h-[20px] rounded-[5px] border-2 shrink-0 flex items-center justify-center transition-colors ${consentNotices ? "bg-[#247ae4] border-[#247ae4]" : "bg-white border-[#c8d9e6] group-hover:border-[#247ae4]"}`}
                    >
                      {consentNotices && (
                        <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      )}
                    </div>
                    <div className="flex flex-col gap-[2px] min-w-0" onClick={() => setConsentNotices(v => !v)}>
                      <p className="font-['DM_Sans:Medium',sans-serif] font-medium text-[#262630] text-[13px]" style={{ fontVariationSettings: '"opsz" 14' }}>
                        I agree to receive legal notices and documents electronically.
                      </p>
                      <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] opacity-55 text-[12px]" style={{ fontVariationSettings: '"opsz" 14' }}>
                        Receive meeting notices, agendas, and ballots via email instead of postal mail.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-[14px] cursor-pointer group">
                    <div
                      onClick={() => setConsentVoting(v => !v)}
                      data-ux-id="elections-consent-voting-checkbox"
                      className={`mt-[1px] w-[20px] h-[20px] rounded-[5px] border-2 shrink-0 flex items-center justify-center transition-colors ${consentVoting ? "bg-[#247ae4] border-[#247ae4]" : "bg-white border-[#c8d9e6] group-hover:border-[#247ae4]"}`}
                    >
                      {consentVoting && (
                        <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      )}
                    </div>
                    <div className="flex flex-col gap-[2px] min-w-0" onClick={() => setConsentVoting(v => !v)}>
                      <p className="font-['DM_Sans:Medium',sans-serif] font-medium text-[#262630] text-[13px]" style={{ fontVariationSettings: '"opsz" 14' }}>
                        I agree to vote and submit proxies electronically for future elections.
                      </p>
                      <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] opacity-55 text-[12px]" style={{ fontVariationSettings: '"opsz" 14' }}>
                        Cast your official ballot online. Your vote is encrypted and verified by a neutral third-party.
                      </p>
                    </div>
                  </label>
                </div>

                <div className="pt-[2px]">
                  <button
                    onClick={() => { setConsentSaved(true); setShowConsentModal(false); setActiveTab("proxy"); }}
                    data-ux-id="elections-consent-submit-button"
                    className="bg-[#247ae4] hover:bg-[#1a6ed0] transition-colors text-white rounded-[10px] px-[22px] py-[10px] font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[14px]"
                    style={{ fontVariationSettings: '"opsz" 14' }}
                  >
                    Yes, I Consent
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Nominations tab */}
        {activeTab === "nominations" && (
          <div data-ux-id="elections-nominations-card" className="bg-white border border-[#d9e7f0] rounded-[18px] w-full flex items-center justify-between px-[24px] py-[18px] shrink-0">
            <div className="flex flex-col gap-[10px] min-w-0">
              <div className="flex flex-col w-full">
                <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[16px] leading-[22.5px]" style={{ fontVariationSettings: '"opsz" 14' }}>
                  Want to run in the upcoming elections?
                </p>
                <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#4b5563] text-[14px] leading-[22.5px]" style={{ fontVariationSettings: '"opsz" 14' }}>
                  Unit 120A – Madison Green
                </p>
              </div>
              <div className="flex flex-col w-full">
                <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] text-[13px] leading-[22.5px]" style={{ fontVariationSettings: '"opsz" 14' }}>
                  Lakestone HOA - Consent Campaign 2026
                </p>
                <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] text-[13px] leading-[22.5px]" style={{ fontVariationSettings: '"opsz" 14' }}>
                  <span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold" style={{ fontVariationSettings: '"opsz" 14' }}>End Date:</span>
                  {" December 18, 2026 7:00PM ET"}
                </p>
              </div>
            </div>
            <div className="shrink-0 pl-[24px]">
              <button data-ux-id="elections-nominations-submit-button" className="bg-[#247ae4] hover:bg-[#1a6ed0] transition-colors text-white rounded-[8px] px-[24px] py-[10px] font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[14px]" style={{ fontVariationSettings: '"opsz" 14' }}>
                Submit Nomination
              </button>
            </div>
          </div>
        )}

        {/* Proxy/Ballot/Meeting tab: open + upcoming elections */}
        {activeTab === "proxy" && <><div data-ux-id="elections-ballot-card" className="border border-[#e2eaf0] rounded-[14px] md:rounded-[18px] w-full flex flex-col md:flex-row md:items-center justify-between gap-[14px] md:gap-[26px] px-[16px] md:px-[26px] py-[16px] md:py-[18px] bg-white shrink-0">
          <div className="flex flex-col gap-[3px] shrink-0 min-w-0">
            <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[15px]" style={{ fontVariationSettings: '"opsz" 14' }}>
              2026 Board of Directors Election – Submit your ballot
            </p>
            <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] opacity-60 text-[13px]" style={{ fontVariationSettings: '"opsz" 14' }}>
              Voting closes on September 15, 2026 at 5:00PM
            </p>
          </div>
          {!ballotSent && (
            <button
              onClick={() => setBallotSent(true)}
              data-ux-id="elections-vote-now-button"
              className="shrink-0 bg-[#247ae4] hover:bg-[#1a6ed0] transition-colors text-white rounded-[10px] px-[22px] py-[10px] font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[14px]"
              style={{ fontVariationSettings: '"opsz" 14' }}
            >
              Vote Now
            </button>
          )}
          {ballotSent && (
            <div data-ux-id="elections-ballot-sent-confirmation" className="flex items-start justify-between gap-[12px] bg-white border border-[#e2eaf0] rounded-[12px] px-[14px] py-[12px] flex-1 min-w-0">
              <div className="flex items-start gap-[12px] min-w-0">
                <div className="w-[34px] h-[34px] rounded-full bg-[#dcfce7] flex items-center justify-center shrink-0">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                    <path d="M20 4H4C2.9 4 2 4.9 2 6v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="#16a34a"/>
                  </svg>
                </div>
                <div className="flex flex-col gap-[2px] min-w-0">
                  <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[13px]" style={{ fontVariationSettings: '"opsz" 14' }}>
                    Check Your Email
                  </p>
                  <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] text-[12px] leading-[1.5]" style={{ fontVariationSettings: '"opsz" 14' }}>
                    A secure voting link has been sent to <span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold opacity-100">username@email.com</span>. Open the email to cast your ballot before September 15, 2026 at 5:00PM.
                  </p>
                  <button
                    data-ux-id="elections-ballot-resend-button"
                    className="self-start mt-[6px] font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#247ae4] text-[12px] hover:underline transition-opacity"
                    style={{ fontVariationSettings: '"opsz" 14' }}
                  >
                    Resend
                  </button>
                </div>
              </div>
              <button
                onClick={() => setBallotSent(false)}
                data-ux-id="elections-ballot-dismiss-button"
                className="shrink-0 text-[#262630] opacity-30 hover:opacity-60 transition-opacity mt-[1px]"
                aria-label="Dismiss"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          )}
        </div></>}

        {/* Campaign cards — open/upcoming: Proxy tab only */}
        {activeTab === "proxy" && campaigns.filter(c => c.status !== "closed").map((campaign, campaignIdx) => {
          const isCollapsed = collapsedCards.has(campaign.id);
          return (
          <Fragment key={campaign.id}>
          <div data-ux-id={`election-campaign-${campaign.id}`} className="w-full bg-white rounded-[18px] border border-[#d9e7f0] drop-shadow-[0px_2px_9px_rgba(18,17,48,0.07)] shrink-0">
            <div className={`px-[16px] md:px-[26px] pt-[20px] md:pt-[24px] flex flex-col gap-[16px] md:gap-[20px] ${isCollapsed ? "pb-[20px] md:pb-[24px]" : "pb-[24px] md:pb-[28px]"}`}>
              {/* Header */}
              <div className="flex flex-col gap-[6px]">
                <div className="flex items-center gap-[10px]">
                  <span className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] opacity-60 text-[13px]" style={{ fontVariationSettings: '"opsz" 14' }}>
                    Voting {campaign.status === "upcoming" ? "opens" : "open"} {campaign.votingPeriod}
                  </span>
                  {campaign.status === "open" ? (
                    <div className="bg-[#dcfce7] rounded-[50px] px-[12px] py-[5px] flex items-center shrink-0">
                      <span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#166534] text-[13px] leading-[19.5px] whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>Open</span>
                    </div>
                  ) : campaign.status === "upcoming" ? (
                    <div className="bg-[#fef3c7] rounded-[50px] px-[12px] py-[5px] flex items-center shrink-0">
                      <span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#92400e] text-[13px] leading-[19.5px] whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>Upcoming</span>
                    </div>
                  ) : (
                    <div className="bg-[#dfeaf0] rounded-[50px] px-[12px] py-[5px] flex items-center shrink-0">
                      <span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[13px] leading-[19.5px] whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>Closed</span>
                    </div>
                  )}
                </div>
                <div className="flex items-start justify-between gap-[12px]">
                  <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[20px] leading-normal flex-1 min-w-0" style={{ fontVariationSettings: '"opsz" 14' }}>
                    {campaign.title}
                  </p>
                  <CollapseButton collapsed={isCollapsed} onToggle={() => toggleCard(campaign.id)} uxId={`election-campaign-${campaign.id}-collapse-button`} />
                </div>
                {!isCollapsed && (
                  <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] opacity-65 text-[14px]" style={{ fontVariationSettings: '"opsz" 14' }}>
                    {campaign.description}
                  </p>
                )}
              </div>

              {!isCollapsed && campaign.participation && (
                <ParticipationBar voted={campaign.participation.voted} total={campaign.participation.total} uxId={`election-campaign-${campaign.id}-participation`} />
              )}

              {/* Board election: candidate grid */}
              {!isCollapsed && campaign.candidates && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[18px]">
                  {campaign.candidates.map((c) => (
                    <div key={c.name} data-ux-id={`election-candidate-${c.name.toLowerCase().replace(/\s+/g, "-")}`} className="border border-[#e8eff5] rounded-[14px] p-[20px] flex flex-col gap-[14px]">
                      <div className="flex items-center gap-[14px]">
                        <div
                          className="w-[36px] h-[36px] rounded-full flex items-center justify-center shrink-0 text-white font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[14px]"
                          style={{ backgroundColor: c.color, fontVariationSettings: '"opsz" 14' }}
                        >
                          {c.initials}
                        </div>
                        <div className="flex flex-col gap-[2px] min-w-0">
                          <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[15px] leading-normal" style={{ fontVariationSettings: '"opsz" 14' }}>
                            {c.name}
                          </p>
                          <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] opacity-60 text-[13px]" style={{ fontVariationSettings: '"opsz" 14' }}>
                            {c.role}
                          </p>
                        </div>
                      </div>
                      <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] opacity-75 text-[13px] leading-[1.6]" style={{ fontVariationSettings: '"opsz" 14' }}>
                        {c.bio}
                      </p>
                      <button data-ux-id={`election-candidate-${c.name.toLowerCase().replace(/\s+/g, "-")}-bio-button`} className="self-start font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#247ae4] text-[13px] hover:underline" style={{ fontVariationSettings: '"opsz" 14' }}>
                        Read full bio
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Election progress tracker — board campaign only */}
              {!isCollapsed && campaign.type === "board" && (
                <div data-ux-id={`election-campaign-${campaign.id}-progress-tracker`} className="border-t border-[#e8eff5] pt-[20px] flex flex-col gap-[16px]">
                  <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[13px]" style={{ fontVariationSettings: '"opsz" 14' }}>Election Progress</p>
                  <div className="flex items-start">
                    {[
                      { label: "Nominations", date: "Jul 1–15", state: "done" },
                      { label: "Notices", date: "Jul 16–28", state: "done" },
                      { label: "Voting", date: "Aug 28–Sep 15", state: "current" },
                      { label: "Results", date: "Sep 20", state: "upcoming" },
                    ].map((step, i, arr) => (
                      <div key={step.label} className="flex items-start flex-1 min-w-0">
                        <div className="flex flex-col items-center flex-1 min-w-0">
                          <div className="flex items-center w-full">
                            <div className={`flex-1 h-[2px] ${i === 0 ? "opacity-0" : arr[i - 1].state === "done" ? "bg-[#247ae4]" : "bg-[#e2eaf0]"}`} />
                            {step.state === "done" ? (
                              <div className="w-[26px] h-[26px] rounded-full bg-[#247ae4] flex items-center justify-center shrink-0">
                                <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2.5 7L5.5 10L11.5 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                              </div>
                            ) : step.state === "current" ? (
                              <div className="w-[26px] h-[26px] rounded-full bg-[#247ae4] flex items-center justify-center shrink-0 ring-[3px] ring-[#bfdbfe]">
                                <div className="w-[9px] h-[9px] rounded-full bg-white" />
                              </div>
                            ) : (
                              <div className="w-[26px] h-[26px] rounded-full bg-white border-2 border-[#e2eaf0] shrink-0" />
                            )}
                            <div className={`flex-1 h-[2px] ${i === arr.length - 1 ? "opacity-0" : step.state === "done" ? "bg-[#247ae4]" : "bg-[#e2eaf0]"}`} />
                          </div>
                          <div className="flex flex-col items-center gap-[4px] mt-[8px] px-[4px] text-center">
                            <span className={`font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[10px] md:text-[12px] leading-tight text-center ${step.state === "upcoming" ? "text-[#262630] opacity-35" : "text-[#262630]"}`} style={{ fontVariationSettings: '"opsz" 14' }}>
                              {step.label}
                            </span>
                            {step.state !== "current" && (
                              <span className={`font-['DM_Sans:Regular',sans-serif] font-normal text-[10px] md:text-[11px] text-center ${step.state === "upcoming" ? "text-[#262630] opacity-30" : "text-[#262630] opacity-55"}`} style={{ fontVariationSettings: '"opsz" 14' }}>
                                {step.date}
                              </span>
                            )}
                            {step.state === "current" && (
                              <span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[11px] text-[#247ae4] bg-[#eff6ff] rounded-[50px] px-[7px] py-[2px]" style={{ fontVariationSettings: '"opsz" 14' }}>In progress</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bylaw / budget: options list */}
              {!isCollapsed && campaign.options && (
                <div className="flex flex-col gap-[10px]">
                  {campaign.options.map((opt, idx) => (
                    <div key={opt.label} data-ux-id={`election-campaign-${campaign.id}-option-${opt.label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`} className="border border-[#e8eff5] rounded-[12px] px-[18px] py-[14px] flex items-start gap-[14px]">
                      <div className="mt-[1px] w-[20px] h-[20px] rounded-full bg-[#f0f5fa] flex items-center justify-center shrink-0">
                        <span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] opacity-60 text-[11px]" style={{ fontVariationSettings: '"opsz" 14' }}>
                          {idx + 1}
                        </span>
                      </div>
                      <div className="flex flex-col gap-[2px] min-w-0">
                        <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[14px]" style={{ fontVariationSettings: '"opsz" 14' }}>
                          {opt.label}
                        </p>
                        <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] opacity-60 text-[13px]" style={{ fontVariationSettings: '"opsz" 14' }}>
                          {opt.description}
                        </p>
                      </div>
                    </div>
                  ))}
                  {campaign.status === "upcoming" && (
                    <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] opacity-40 text-[12px] mt-[2px]" style={{ fontVariationSettings: '"opsz" 14' }}>
                      Voting opens {campaign.votingPeriod.split("–")[0].trim()}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
          </Fragment>
          );
        })}

        {/* Results tab: closed election card */}
        {activeTab === "results" && <CompletedElectionCard collapsed={collapsedCards.has("completed-2025")} onToggle={() => toggleCard("completed-2025")} />}

      </div>

      {/* Floating elections tab pill — bottom-left */}
      <div
        data-ux-id="elections-tab-toggle"
        className="fixed bottom-6 left-6 z-50 flex items-center bg-[#1a1f2e] rounded-full shadow-[0_4px_24px_rgba(0,0,0,0.35)] p-[5px] gap-[2px]"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            data-ux-id={`elections-tab-${tab.id}`}
            className={`px-[14px] py-[8px] rounded-full text-[13px] font-['DM_Sans:SemiBold',sans-serif] font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.id ? "bg-[#2d3550] text-white" : "text-[#8a95ab] hover:text-white"
            }`}
            style={{ fontVariationSettings: '"opsz" 14' }}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Community Feed ─── */
type CommunityPost = {
  id: number;
  title: string;
  body: string;
  date: string;
  author: string;
  initials: string;
  image?: string;
  imageAlt?: string;
  likes: number;
  official?: boolean;
  postedByBoard?: boolean;
  links?: { label: string; href: string }[];
};

const initialCommunityPosts: CommunityPost[] = [
  {
    id: 1,
    title: "Food Truck Friday is back",
    body: "Join your neighbors by the clubhouse this Friday from 5–8 PM. Local favorites will be serving dinner, with lawn games and live acoustic music for the whole family.",
    date: "07/30/2026",
    author: "Waterfront Community Association",
    initials: "WC",
    image: "/assets/community-cafe.png",
    imageAlt: "Neighbors enjoying food and conversation at an outdoor cafe",
    likes: 24,
    official: true,
    postedByBoard: true,
    links: [
      { label: "waterfrontcommunity.org/events", href: "https://waterfrontcommunity.org/events" },
      { label: "foodtruckfriday.com", href: "https://foodtruckfriday.com" },
    ],
  },
  {
    id: 2,
    title: "Tennis courts reopen Saturday",
    body: "The resurfacing project is complete. Courts one through four reopen at 8 AM Saturday, and reservations are now available in the resident portal.",
    date: "07/28/2026",
    author: "Waterfront Community Association",
    initials: "WC",
    image: "/assets/community-tennis.jpg",
    imageAlt: "Aerial view of neighborhood tennis courts surrounded by trees",
    likes: 18,
    official: true,
    postedByBoard: true,
    links: [
      { label: "waterfrontcommunity.org/tennis", href: "https://waterfrontcommunity.org/tennis" },
      { label: "reserve.waterfrontcommunity.org", href: "https://reserve.waterfrontcommunity.org" },
    ],
  },
  {
    id: 3,
    title: "Community garden volunteer morning",
    body: "We are refreshing the raised beds and planting fall vegetables this Sunday at 9 AM. Tools and cold water will be provided—beginners and young helpers are welcome.",
    date: "07/26/2026",
    author: "Waterfront Community Association",
    initials: "WC",
    image: "/assets/community-garden.jpg",
    imageAlt: "Volunteers tending raised beds in a community garden",
    likes: 31,
    official: true,
    links: [
      { label: "waterfrontcommunity.org/garden", href: "https://waterfrontcommunity.org/garden" },
    ],
  },
  {
    id: 4,
    title: "Pool deck maintenance reminder",
    body: "The family pool will close Tuesday from 7 AM–1 PM for routine deck cleaning. The lap pool and splash pad will remain open during this time.",
    date: "07/24/2026",
    author: "Waterfront Community Association",
    initials: "WC",
    image: "/assets/community-pool.jpg",
    imageAlt: "Community pool with lounge chairs and palm trees",
    likes: 12,
    official: true,
    links: [
      { label: "waterfrontcommunity.org/pool", href: "https://waterfrontcommunity.org/pool" },
    ],
  },
  {
    id: 5,
    title: "Welcome our newest neighbors",
    body: "Please join us in welcoming the Patel, Romero, and Williams families to Waterfront Community Estates. We hope to see everyone at the new resident coffee next Saturday at 10 AM.",
    date: "07/21/2026",
    author: "Waterfront Community Association",
    initials: "WC",
    likes: 42,
    official: true,
    links: [
      { label: "waterfrontcommunity.org/welcome", href: "https://waterfrontcommunity.org/welcome" },
      { label: "waterfrontcommunity.org/directory", href: "https://waterfrontcommunity.org/directory" },
    ],
  },
];

const editorTools = [
  { src: "/assets/editor-c9e82.svg", label: "Undo" },
  { src: "/assets/editor-d69e2.svg", label: "Redo" },
  { src: "/assets/editor-83e4c.svg", label: "Bold" },
  { src: "/assets/editor-a3267.svg", label: "Italic" },
  { src: "/assets/editor-12cce.svg", label: "Underline" },
  { src: "/assets/editor-6f139.svg", label: "Strikethrough" },
  { src: "/assets/editor-634f9.svg", label: "Bulleted list" },
  { src: "/assets/editor-8069e.svg", label: "Numbered list" },
  { src: "/assets/editor-4f8a2.svg", label: "Add link" },
  { src: "/assets/editor-7e6f1.svg", label: "Add image" },
  { src: "/assets/editor-de8c5.svg", label: "Code" },
];

function CreatePostModal({
  onClose,
  onPublish,
}: {
  onClose: () => void;
  onPublish: (title: string, body: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [fileName, setFileName] = useState("");

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !body.trim()) return;
    onPublish(title.trim(), body.trim());
  };

  return (
    <div data-ux-id="community-feed-create-post-modal" className="fixed inset-0 z-[70] flex items-center justify-center bg-[#152331]/45 p-[12px] md:p-[24px]" role="presentation" onMouseDown={onClose}>
      <form
        className="flex max-h-[calc(100dvh-24px)] w-full max-w-[890px] flex-col overflow-hidden rounded-[6px] border border-[#e3e3e3] bg-white shadow-[0_20px_60px_rgba(18,17,48,0.22)] md:max-h-[calc(100dvh-48px)]"
        onSubmit={submit}
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-post-title"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[#e1e9ef] px-[20px] py-[16px] md:px-[32px]">
          <p id="new-post-title" className="font-['DM_Sans:SemiBold',sans-serif] text-[20px] font-semibold leading-[24px] text-[#262630]" style={{ fontVariationSettings: '"opsz" 14' }}>New Post</p>
          <button type="button" onClick={onClose} data-ux-id="community-feed-create-post-modal-close-button" className="flex size-[32px] items-center justify-center rounded-[6px] text-[#262630] transition-colors hover:bg-[#f2f5f7]" aria-label="Close new post editor">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-[20px] overflow-y-auto px-[20px] py-[24px] md:px-[64px]">
          <label className="flex flex-col gap-[7px] font-['DM_Sans:SemiBold',sans-serif] text-[14px] font-semibold text-[#1a1a1a]" style={{ fontVariationSettings: '"opsz" 14' }}>
            Title
            <input
              autoFocus
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Community Post Title"
              data-ux-id="community-feed-create-post-title-input"
              className="h-[45px] w-full rounded-[6px] border border-[#cfd3da] bg-white px-[20px] font-['DM_Sans:Regular',sans-serif] text-[14px] font-normal text-[#1a1a1a] outline-none transition-shadow placeholder:text-[#1a1a1a]/50 focus:border-[#247ae4] focus:ring-2 focus:ring-[#247ae4]/15"
              required
            />
          </label>

          <label className="flex flex-col gap-[10px] font-['DM_Sans:SemiBold',sans-serif] text-[14px] font-semibold text-[#1a1a1a]" style={{ fontVariationSettings: '"opsz" 14' }}>
            Body
            <div className="overflow-hidden rounded-[6px] border border-[#cfd3da] bg-white focus-within:border-[#247ae4] focus-within:ring-2 focus-within:ring-[#247ae4]/15">
              <div className="flex min-h-[45px] items-center gap-[4px] overflow-x-auto border-b border-[#cfd3da] p-[8px]">
                {editorTools.slice(0, 2).map((tool) => (
                  <button key={tool.label} type="button" className="flex size-[28px] shrink-0 items-center justify-center rounded-[4px] hover:bg-[#f1f3f5]" aria-label={tool.label}>
                    <img src={tool.src} alt="" width="20" height="20" />
                  </button>
                ))}
                <button type="button" className="flex h-[28px] shrink-0 items-center gap-[4px] rounded-[4px] px-[8px] font-['DM_Sans:Regular',sans-serif] text-[14px] font-normal text-[#262630] hover:bg-[#f1f3f5]">
                  Paragraph
                  <img src="/assets/editor-52726.svg" alt="" width="16" height="16" />
                </button>
                <button type="button" className="hidden h-[28px] shrink-0 items-center gap-[2px] rounded-[4px] px-[4px] hover:bg-[#f1f3f5] sm:flex" aria-label="Text alignment">
                  <img src="/assets/editor-9856c.svg" alt="" width="20" height="20" />
                  <img src="/assets/editor-52726.svg" alt="" width="16" height="16" />
                </button>
                {editorTools.slice(2).map((tool) => (
                  <button key={tool.label} type="button" className="flex size-[28px] shrink-0 items-center justify-center rounded-[4px] hover:bg-[#f1f3f5]" aria-label={tool.label}>
                    <img src={tool.src} alt="" width="20" height="20" />
                  </button>
                ))}
              </div>
              <textarea
                value={body}
                onChange={(event) => setBody(event.target.value)}
                data-ux-id="community-feed-create-post-body-textarea"
                className="h-[180px] w-full resize-none p-[14px] font-['DM_Sans:Regular',sans-serif] text-[14px] font-normal leading-[1.5] text-[#262630] outline-none"
                aria-label="Post body"
                required
              />
            </div>
            <span className="font-['DM_Sans:Regular',sans-serif] text-[13px] font-normal text-[#4b5563]">Paste is converted to plain text to keep formatting clean.</span>
          </label>

          <label className="flex flex-col gap-[7px] font-['DM_Sans:SemiBold',sans-serif] text-[14px] font-semibold text-[#1a1a1a]" style={{ fontVariationSettings: '"opsz" 14' }}>
            Attachments
            <span className="relative flex min-h-[147px] cursor-pointer flex-col items-center justify-center gap-[9px] rounded-[6px] border border-dashed border-[#cfd3da] bg-[#f9fafb] p-[20px] text-center">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 16V3m0 0L7.5 7.5M12 3l4.5 4.5M5 13v6a2 2 0 002 2h10a2 2 0 002-2v-6" stroke="#65666e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span className="font-['DM_Sans:Regular',sans-serif] text-[14px] font-normal text-black">{fileName || "Drag & Drop or "}<span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#247ae4] underline">{fileName ? "" : "Choose file"}</span>{fileName ? "" : " to upload"}</span>
              <span className="font-['DM_Sans:Regular',sans-serif] text-[12px] font-normal uppercase text-[#54585e]">PDF, ZIP, PNG, JPEG</span>
              <span className="font-['DM_Sans:Regular',sans-serif] text-[12px] font-normal text-[#54585e]">MAX 25 MB total</span>
              <input data-ux-id="community-feed-create-post-attachment-input" className="absolute inset-0 cursor-pointer opacity-0" type="file" accept=".pdf,.zip,.png,.jpg,.jpeg" onChange={(event) => setFileName(event.target.files?.[0]?.name ?? "")} />
            </span>
          </label>

          <div className="flex flex-col gap-[7px]">
            <p className="font-['DM_Sans:SemiBold',sans-serif] text-[14px] font-semibold text-[#1a1a1a]">Citations</p>
            <button type="button" data-ux-id="community-feed-create-post-add-caption-button" className="flex w-fit items-center gap-[8px] rounded-[8px] border border-[#e0e0e0] px-[24px] py-[12px] font-['DM_Sans:SemiBold',sans-serif] text-[14px] font-semibold text-[#262530] hover:bg-[#f9fafb]">
              <span className="text-[19px] font-normal leading-none">+</span> Add Caption
            </button>
          </div>
        </div>

        <div className="flex shrink-0 justify-end gap-[15px] border-t border-[#e1e9ef] px-[20px] py-[16px] md:px-[32px]">
          <button type="button" onClick={onClose} data-ux-id="community-feed-create-post-cancel-button" className="rounded-[8px] bg-[#f6f6f6] px-[16px] py-[8px] font-['DM_Sans:SemiBold',sans-serif] text-[14px] font-semibold leading-[21px] text-[#262630] hover:bg-[#ececec]">Cancel</button>
          <button type="submit" data-ux-id="community-feed-create-post-publish-button" className="rounded-[8px] bg-[#247ae4] px-[16px] py-[8px] font-['DM_Sans:SemiBold',sans-serif] text-[14px] font-semibold leading-[21px] text-white hover:bg-[#176dcb] disabled:cursor-not-allowed disabled:opacity-50" disabled={!title.trim() || !body.trim()}>Publish Post</button>
        </div>
      </form>
    </div>
  );
}

function CommunityFeedPage({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const [posts, setPosts] = useState(initialCommunityPosts);
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [createPostOpen, setCreatePostOpen] = useState(false);

  const toggleLike = (postId: number) => {
    setLikedPosts((current) => {
      const next = new Set(current);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  };

  const publishPost = (title: string, body: string) => {
    setPosts((current) => [{
      id: Date.now(),
      title,
      body,
      date: new Intl.DateTimeFormat("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }).format(new Date()),
      author: "Waterfront Community Association",
      initials: "WC",
      likes: 0,
      official: true,
      postedByBoard: true,
    }, ...current]);
    setCreatePostOpen(false);
  };

  return (
    <div data-ux-id="community-feed-page" className="flex-1 min-w-0 h-full overflow-y-auto">
      <div className="md:hidden flex items-center justify-between px-[16px] py-[14px] bg-white border-b border-[#d9ecf8] shrink-0">
        <button onClick={onOpenSidebar} data-ux-id="community-mobile-menu-button" className="w-[36px] h-[36px] flex items-center justify-center rounded-[8px] hover:bg-[#f0f5fa] transition-colors" aria-label="Open menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M3 12h18M3 18h18" stroke="#262630" strokeWidth="2" strokeLinecap="round"/></svg>
        </button>
        <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[17px]" style={{ fontVariationSettings: '"opsz" 14' }}>Community Feed</p>
        <div className="w-[36px]" />
      </div>

      <div className="flex w-full max-w-[1280px] mx-auto flex-col gap-[24px] px-[16px] pb-[44px] pt-[20px] md:gap-[32px] md:px-[44px] md:pt-[31px]">
        <div className="hidden w-full items-center justify-between gap-[28px] md:flex">
          <div className="min-w-0 flex-1">
            <p className="font-['DM_Sans:SemiBold',sans-serif] text-[28px] font-semibold leading-normal text-[#262630]" style={{ fontVariationSettings: '"opsz" 14' }}>Community Feed</p>
            <p className="font-['DM_Sans:Regular',sans-serif] text-[16px] font-normal leading-normal text-[#262630]/70" style={{ fontVariationSettings: '"opsz" 14' }}>Connect with your neighbors and stay updated on community happenings</p>
          </div>
          <AddressCard />
        </div>

        <div className="mx-auto flex w-full max-w-[673px] flex-col gap-[16px]">
          <div data-ux-id="community-feed-create-post-card" className="flex items-center gap-[14px] rounded-[18px] bg-white px-[18px] py-[18px] shadow-[0px_2px_9px_rgba(18,17,48,0.07)] md:px-[26px] md:py-[24px]">
            <p className="min-w-0 flex-1 font-['DM_Sans:SemiBold',sans-serif] text-[17px] font-semibold text-[#262630] md:text-[20px]" style={{ fontVariationSettings: '"opsz" 14' }}>What’s happening in the community?</p>
            <button onClick={() => setCreatePostOpen(true)} data-ux-id="community-feed-create-post-button" className="flex shrink-0 items-center gap-[8px] rounded-[8px] bg-[#247ae4] px-[14px] py-[8px] font-['DM_Sans:SemiBold',sans-serif] text-[14px] font-semibold leading-[21px] text-white shadow-sm transition-colors hover:bg-[#176dcb]">
              <span className="text-[18px] font-normal leading-none">+</span>
              <span className="hidden sm:inline">Create Post</span>
              <span className="sm:hidden">Post</span>
            </button>
          </div>

          {posts.map((post) => {
            const liked = likedPosts.has(post.id);
            return (
              <article key={post.id} data-ux-id={`community-feed-post-${post.id}`} className="flex w-full flex-col gap-[20px] rounded-[18px] border border-[#d9e7f0] bg-white px-[18px] pb-[16px] pt-[22px] shadow-[0px_2px_9px_rgba(18,17,48,0.07)] md:gap-[24px] md:px-[26px] md:pt-[24px]">
                <div className="flex items-start gap-[14px]">
                  <div className="flex size-[36px] shrink-0 items-center justify-center rounded-full bg-[#247ae4] font-['Open_Sans:Regular',sans-serif] text-[13px] font-normal text-white" style={{ fontVariationSettings: '"wdth" 100' }}>{post.initials}</div>
                  <div className="min-w-0 flex-1">
                    <p className="font-['DM_Sans:SemiBold',sans-serif] text-[14px] font-semibold leading-[1.2] text-[#262630]" style={{ fontVariationSettings: '"opsz" 14' }}>{post.author}</p>
                    {post.postedByBoard ? (
                      <p className="mt-[5px] font-['DM_Sans:Regular',sans-serif] text-[12px] font-normal leading-[1.2] text-[#4b5563]" style={{ fontVariationSettings: '"opsz" 14' }}>
                        Posted by your Board · {post.date}
                      </p>
                    ) : (
                      <div className="mt-[5px] flex items-center gap-[7px] font-['DM_Sans:Regular',sans-serif] text-[12px] font-normal leading-[1.2]" style={{ fontVariationSettings: '"opsz" 14' }}>
                        <span className="text-[#4b5563]">{post.date}</span>
                        <span className="text-[#4b5563]">·</span>
                        <span className="flex items-center gap-[4px] text-[#009c68]">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                            <path d="M5.625 0C5.74219 0 5.83594 0.0234375 5.92969 0.0703125L10.3594 1.94531C10.875 2.15625 11.25 2.67188 11.25 3.28125C11.25 5.60156 10.2891 9.86719 6.25781 11.7891C5.85938 11.9766 5.39062 11.9766 5.01562 11.7891C0.960938 9.86719 0.0234375 5.60156 0 3.28125C0 2.67188 0.375 2.15625 0.890625 1.94531L5.32031 0.0703125C5.41406 0.0234375 5.50781 0 5.625 0ZM1.33594 2.97656C1.19531 3.04688 1.125 3.16406 1.125 3.28125C1.14844 5.41406 2.03906 9.11719 5.50781 10.7812C5.57812 10.8281 5.67188 10.8281 5.76562 10.7812C9.23438 9.11719 10.125 5.41406 10.125 3.28125C10.125 3.16406 10.0547 3.04688 9.91406 2.97656L5.625 1.14844L1.33594 2.97656ZM6.96094 3.79688C7.14844 3.53906 7.5 3.49219 7.75781 3.67969C8.01562 3.84375 8.0625 4.19531 7.875 4.45312L5.48438 7.75781C5.39062 7.89844 5.22656 7.96875 5.0625 7.99219C4.89844 7.99219 4.73438 7.94531 4.61719 7.80469L3.53906 6.67969C3.32812 6.46875 3.32812 6.11719 3.53906 5.90625C3.77344 5.67188 4.125 5.69531 4.33594 5.90625L4.96875 6.5625L6.96094 3.79688Z" fill="currentColor"/>
                          </svg>
                          Verified Safe
                        </span>
                      </div>
                    )}
                  </div>
                  {post.official && (
                    <span className="flex shrink-0 items-center gap-[5px] rounded-full bg-[#247ae4] px-[12px] py-[4px] font-['DM_Sans:SemiBold',sans-serif] text-[12px] font-semibold text-white md:px-[16px] md:text-[13px]">
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                        <path d="M6.44922 0.0761719L11.2227 2.10742C11.7812 2.36133 12.2129 2.89453 12.2129 3.55469C12.1875 6.09375 11.1465 10.6895 6.7793 12.7969C6.34766 13 5.86523 13 5.43359 12.7969C1.06641 10.6895 0.0253906 6.09375 0.0253906 3.55469C0 2.89453 0.431641 2.36133 0.990234 2.10742L5.76367 0.0761719C5.86523 0.0253906 5.99219 0 6.11914 0C6.2207 0 6.34766 0.0253906 6.44922 0.0761719ZM8.98828 5.30664H8.96289C9.2168 5.07812 9.2168 4.69727 8.96289 4.44336C8.73438 4.21484 8.35352 4.21484 8.125 4.44336L5.30664 7.28711L4.11328 6.09375C3.85938 5.83984 3.47852 5.83984 3.25 6.09375C2.99609 6.32227 2.99609 6.70312 3.25 6.93164L4.875 8.55664C5.10352 8.81055 5.48438 8.81055 5.73828 8.55664L8.98828 5.30664Z" fill="white"/>
                      </svg>
                      Official
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-[14px] md:gap-[18px]">
                  <p className="font-['DM_Sans:SemiBold',sans-serif] text-[18px] font-semibold leading-[1.2] text-black" style={{ fontVariationSettings: '"opsz" 14' }}>{post.title}</p>
                  <p className="font-['DM_Sans:Regular',sans-serif] text-[15px] font-normal leading-[1.35] text-[#4b5563] md:text-[16px]" style={{ fontVariationSettings: '"opsz" 14' }}>{post.body}</p>
                  {post.image && <img src={post.image} alt={post.imageAlt ?? ""} className="aspect-[621/316] w-full rounded-[16px] object-cover" />}
                  {post.links && post.links.length > 0 && (
                    <div className="flex flex-wrap gap-[9px]">
                      {post.links.map((link, linkIdx) => (
                        <a
                          key={link.href}
                          href={link.href}
                          target="_blank"
                          rel="noreferrer"
                          data-ux-id={`community-feed-post-${post.id}-link-${linkIdx}`}
                          className="max-w-full truncate rounded-full bg-[#e8f1f6] px-[15px] py-[8px] font-['DM_Sans:SemiBold',sans-serif] text-[13px] font-semibold leading-[1.2] text-[#262630] transition-colors hover:bg-[#d9eaf3] hover:text-[#247ae4] md:px-[18px] md:text-[14px]"
                        >
                          {link.label}
                        </a>
                      ))}
                    </div>
                  )}
                  <div className="border-t border-[#d9e7f0]" />
                  <button onClick={() => toggleLike(post.id)} aria-pressed={liked} data-ux-id={`community-feed-post-${post.id}-like-button`} className={`flex w-fit items-center gap-[7px] rounded-[6px] px-[2px] py-[2px] font-['DM_Sans:Regular',sans-serif] text-[13px] font-normal transition-colors ${liked ? "text-[#247ae4]" : "text-[#262630] hover:text-[#247ae4]"}`}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"}><path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3m0 11V11l4-9a3 3 0 013 3v4h5.1a2.5 2.5 0 012.45 3l-1.5 7.5A3 3 0 0117.1 22H7z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    {liked ? "Liked" : "Like"} · {post.likes + (liked ? 1 : 0)}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
      {createPostOpen && <CreatePostModal onClose={() => setCreatePostOpen(false)} onPublish={publishPost} />}
    </div>
  );
}

/* ─── Main Portal (post-onboarding) ─── */
type MainAppProps = {
  onRestart: () => void;
  externalNavRequest?: string | null;
  onExternalNavConsumed?: () => void;
};

function MainApp({ onRestart, externalNavRequest, onExternalNavConsumed }: MainAppProps) {
  const [activePage, setActivePage] = useState<Page>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardView, setDashboardView] = useState<DashboardView>("homeowner");

  useEffect(() => {
    if (!externalNavRequest) return;
    if (
      externalNavRequest === "dashboard" ||
      externalNavRequest === "elections" ||
      externalNavRequest === "community" ||
      externalNavRequest === "amenities"
    ) {
      setActivePage(externalNavRequest);
    }
    onExternalNavConsumed?.();
  }, [externalNavRequest, onExternalNavConsumed]);

  const navigate = (page: Page) => {
    setActivePage(page);
    setSidebarOpen(false);
  };

  return (
    <div data-ux-id="app-shell" className="bg-gradient-to-b from-[#edf9f2] to-[#ddf2ff] flex h-full w-full overflow-hidden">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          data-ux-id="sidebar-mobile-backdrop"
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {/* Sidebar — desktop always visible, mobile slides in as overlay */}
      <div className={`fixed md:static inset-y-0 left-0 z-50 transition-transform duration-300 md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <Sidebar activePage={activePage} onNavigate={navigate} onClose={() => setSidebarOpen(false)} onRestart={onRestart} dashboardView={dashboardView} />
      </div>
      {activePage === "dashboard" ? (
        <DashboardPage onNavigate={navigate} onOpenSidebar={() => setSidebarOpen(true)} view={dashboardView} />
      ) : activePage === "elections" ? (
        <ElectionsPage onOpenSidebar={() => setSidebarOpen(true)} />
      ) : activePage === "amenities" ? (
        <AmenitiesPage onOpenSidebar={() => setSidebarOpen(true)} />
      ) : (
        <CommunityFeedPage onOpenSidebar={() => setSidebarOpen(true)} />
      )}
      {/* Floating view toggle — only on dashboard */}
      {activePage === "dashboard" && (
        <ViewToggle view={dashboardView} onChange={setDashboardView} />
      )}
    </div>
  );
}

/* ─── Root App — gates onboarding before the resident portal ─── */
type AppPhase = "onboarding" | "portal";

type AppProps = {
  externalNavRequest?: string | null;
  onExternalNavConsumed?: () => void;
};

export default function App({ externalNavRequest, onExternalNavConsumed }: AppProps = {}) {
  const [phase, setPhase] = useState<AppPhase>("onboarding");

  if (phase === "onboarding") {
    return <NewResidentFlow onComplete={() => setPhase("portal")} />;
  }

  return (
    <MainApp
      onRestart={() => setPhase("onboarding")}
      externalNavRequest={externalNavRequest}
      onExternalNavConsumed={onExternalNavConsumed}
    />
  );
}
