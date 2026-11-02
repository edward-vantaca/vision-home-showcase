import type { ReactNode } from "react";
import imgHero from "@/assets/presidential-valley-hero.webp";
import imgLogo from "@/assets/presidential-valley-logo.png";
import { usePageLoad } from "../pageLoad";
import PageLoader from "../PageLoader";
import { VT } from "../walkthrough/viewTransitionNames";

// The association's public home page (Presidential Valley), where Log Out in
// the portal redirects. Loads like a portal page: a spinner, then the content.

// Taken from the logo: its gold sun and wordmark, its slate-teal trees.
const GOLD = "#fcd37f";
const SLATE = "#49646a";
const DEEP = "#2c4448"; // slate, darkened for dark sections and headings
const GOLD_TEXT = "#8f6514"; // gold, darkened to read on light grounds
const SAND = "#f3e6c8";
const SAND_EDGE = "#e7d4a8"; // hairline border for sand tiles
const CREAM = "#faf6ee";
const BODY = "#4b5b5e"; // body copy on light grounds
// Below the fold, content is capped at this width; section backgrounds stay full-bleed.
const CONTENT = "mx-auto w-full max-w-[1200px]";
const FONT = "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif";
// One heading scale for every section below the fold.
const H2 = "mt-[12px] text-[36px] font-semibold leading-tight tracking-[-0.01em]";

// Line icons (24px grid, stroked) for the tiles, contact rows and community highlights.
const ICONS = {
  card: "M3 7.5A2.5 2.5 0 0 1 5.5 5h13A2.5 2.5 0 0 1 21 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 16.5v-9ZM3 10h18M7 15h3",
  doc: "M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5ZM14 3v5h5M9 13h6M9 17h6",
  calendar: "M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2ZM3 10h18M8 3v4M16 3v4",
  chat: "M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z",
  mail: "M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1ZM3.5 7l8.5 6 8.5-6",
  phone: "M5 4h3.5l1.5 4.5-2 1.5a11 11 0 0 0 6 6l1.5-2L20 15.5V19a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1Z",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3 2",
  flag: "M5 21V4M5 4h11l-2 4 2 4H5",
  tree: "M12 3 6 12h3l-4 6h14l-4-6h3L12 3ZM12 18v3",
  home: "M3 11 12 4l9 7M5 10v10h14V10M10 20v-5h4v5",
};

function Icon({ name, size = 22 }: { name: keyof typeof ICONS; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d={ICONS[name]} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const QUICK_ACCESS: { title: string; body: string; icon: keyof typeof ICONS }[] = [
  { title: "Pay Online", body: "Dues, assessments, and account balance.", icon: "card" },
  { title: "Documents", body: "CC&Rs, rules, meeting minutes, forms.", icon: "doc" },
  { title: "Calendar", body: "Board meetings, community events, deadlines.", icon: "calendar" },
  { title: "Contact Us", body: "Reach your management team by email.", icon: "chat" },
];

const HIGHLIGHTS: { title: string; body: string; icon: keyof typeof ICONS }[] = [
  { title: "Championship golf", body: "Eighteen holes winding through the heart of the community.", icon: "flag" },
  { title: "Lakes & trails", body: "Quiet water views and miles of shaded walking paths.", icon: "tree" },
  { title: "Clubhouse & amenities", body: "Pool, fitness center, and tennis courts for every resident.", icon: "home" },
];

const FOOTER_LINKS = ["Home", "Documents", "Help & FAQs", "Calendar"];

function Eyebrow({ children, color = GOLD_TEXT }: { children: string; color?: string }) {
  return (
    <p className="text-[14px] font-semibold uppercase tracking-[0.18em]" style={{ color }}>
      {children}
    </p>
  );
}

function ContactRow({ icon, label, children }: { icon: keyof typeof ICONS; label: string; children: ReactNode }) {
  return (
    <div className="flex gap-[18px]">
      <span className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full" style={{ background: SAND, color: DEEP }}>
        <Icon name={icon} />
      </span>
      <div>
        <Eyebrow>{label}</Eyebrow>
        {children}
      </div>
    </div>
  );
}

export default function AssociationSite({ onLogIn }: { onLogIn: () => void }) {
  const loading = usePageLoad();

  return (
    <div data-ux-id="association-site" data-vt-name={VT.AssociationSitePage} className="h-full overflow-y-auto bg-white" style={{ fontFamily: FONT }}>
      {loading ? (
        <PageLoader uxId="association-site-loader" />
      ) : (
        <div className="animate-[page-content-in_300ms_ease-out]">
          {/* Header */}
          <header className="flex h-[60px] items-center justify-between border-b border-[#e9ecec] px-[27px] md:px-[31px]">
            <button type="button" className="flex items-center gap-[12px] text-[15px] font-medium" style={{ color: DEEP }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Menu
            </button>
            <div className="flex items-center gap-[10px]">
              <button type="button" className="hidden sm:block rounded-[6px] px-[16px] py-[8px] text-[14px] font-semibold text-white" style={{ background: DEEP }}>
                Pay Now
              </button>
              <button
                type="button"
                onClick={onLogIn}
                data-ux-id="association-site-login"
                className="flex items-center gap-[7px] rounded-[6px] border border-[#d5dcdd] bg-white px-[16px] py-[7px] text-[14px] font-semibold"
                style={{ color: DEEP }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4.5 20a7.5 7.5 0 0 1 15 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                Log In
              </button>
            </div>
          </header>

          {/* Hero */}
          {/* Fills the first screen below the header; the photo settles in slowly as the page appears. */}
          <section className="relative flex min-h-[max(640px,calc(100vh-60px))] flex-col items-center justify-center overflow-hidden px-[27px] pt-[80px] pb-[120px] text-center">
            <img
              src={imgHero}
              alt=""
              className="absolute inset-0 h-full w-full object-cover motion-safe:animate-[hero-settle_9s_ease-out_both]"
              style={{ objectPosition: "50% 55%" }}
            />
            {/* Darkest behind the text and along the edges, so the course still reads through the middle. */}
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 55% 50% at 50% 48%, rgba(10, 24, 36, 0.45), rgba(10, 24, 36, 0) 70%), linear-gradient(rgba(10, 24, 36, 0.62), rgba(10, 24, 36, 0.38) 45%, rgba(10, 24, 36, 0.82))",
              }}
            />
            <div className="relative flex flex-col items-center">
              <img src={imgLogo} alt="Presidential Valley" className="w-[200px] drop-shadow-[0_4px_16px_rgba(0,0,0,0.35)]" />
              <span aria-hidden="true" className="mt-[40px] h-px w-[72px]" style={{ background: GOLD, opacity: 0.7 }} />
              <h1 className="mt-[32px] text-[58px] md:text-[64px] font-light uppercase leading-[1.05] tracking-[0.08em] [text-shadow:0_2px_16px_rgba(0,0,0,0.4)]" style={{ color: SAND }}>
                Welcome Home
              </h1>
              <p className="mt-[24px] max-w-[620px] text-[19px] leading-[1.65] text-white/75 [text-shadow:0_1px_8px_rgba(0,0,0,0.35)]">
                Gulf-coast living, day to day. Your resident portal for Presidential Valley keeps dues, documents, and your
                management team a single tap away.
              </p>
              <div className="mt-[44px] flex flex-wrap justify-center gap-[14px]">
                <button
                  type="button"
                  onClick={onLogIn}
                  className="rounded-[6px] px-[32px] py-[15px] text-[17px] font-semibold shadow-[0_8px_24px_rgba(0,0,0,0.3)]"
                  style={{ background: SAND, color: DEEP }}
                >
                  Log In to Portal
                </button>
                <button
                  type="button"
                  className="rounded-[6px] border border-white/45 bg-white/10 px-[32px] py-[15px] text-[17px] font-semibold text-white backdrop-blur-[6px]"
                >
                  Pay Online
                </button>
              </div>
            </div>
            <div aria-hidden="true" className="absolute bottom-[32px] left-1/2 flex -translate-x-1/2 flex-col items-center gap-[8px] text-white/60">
              <span className="text-[12px] font-semibold uppercase tracking-[0.2em]">Explore</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </section>

          {/* Quick access */}
          <section className="px-[27px] py-[96px] text-center">
            <Eyebrow>Quick access</Eyebrow>
            <h2 className={H2} style={{ color: DEEP }}>
              What can we help you with?
            </h2>
            <div className={`${CONTENT} mt-[48px] grid grid-cols-1 gap-[20px] sm:grid-cols-2 lg:grid-cols-4`}>
              {QUICK_ACCESS.map((tile) => (
                <div
                  key={tile.title}
                  className="flex flex-col items-center rounded-[12px] border px-[24px] pt-[32px] pb-[28px]"
                  style={{ background: SAND, borderColor: SAND_EDGE, color: DEEP }}
                >
                  <span className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-white/80">
                    <Icon name={tile.icon} size={24} />
                  </span>
                  <p className="mt-[18px] text-[20px] font-semibold">{tile.title}</p>
                  <p className="mt-[8px] max-w-[220px] text-[15px] leading-[1.5]" style={{ color: BODY }}>
                    {tile.body}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* About */}
          <section className="px-[27px] py-[96px] text-center" style={{ background: DEEP }}>
            <Eyebrow color={GOLD}>About the community</Eyebrow>
            <h2 className={`${H2} text-white`}>Welcome to Presidential Valley</h2>
            <p className="mx-auto mt-[20px] max-w-[760px] text-[18px] leading-[1.7] text-white/75">
              Presidential Valley wraps around a championship golf course, quiet lakes, and miles of walking trails. Neighbors
              meet at the clubhouse, the pool, and the tennis courts, and the board keeps the grounds as beautiful as the
              day you moved in.
            </p>
            <div className={`${CONTENT} mt-[56px] grid grid-cols-1 gap-[32px] border-t border-white/15 pt-[48px] md:grid-cols-3`}>
              {HIGHLIGHTS.map((item) => (
                <div key={item.title} className="flex flex-col items-center">
                  <span style={{ color: GOLD }}>
                    <Icon name={item.icon} size={28} />
                  </span>
                  <p className="mt-[14px] text-[18px] font-semibold text-white">{item.title}</p>
                  <p className="mt-[6px] max-w-[280px] text-[15px] leading-[1.55] text-white/65">{item.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Get in touch */}
          <section className="px-[27px] py-[96px]" style={{ background: CREAM }}>
            <div className="text-center">
              <Eyebrow>Contact</Eyebrow>
              <h2 className={H2} style={{ color: DEEP }}>
                Get in Touch
              </h2>
            </div>
            <div
              className={`${CONTENT} mt-[48px] grid grid-cols-1 items-center gap-[48px] overflow-hidden rounded-[16px] bg-white p-[24px] shadow-[0_1px_2px_rgba(44,68,72,0.06),0_12px_32px_rgba(44,68,72,0.08)] md:grid-cols-2 md:p-[32px]`}
            >
              <img src={imgHero} alt="" className="aspect-[3/2] w-full rounded-[10px] object-cover" style={{ objectPosition: "50% 60%" }} />
              <div className="flex flex-col gap-[32px] md:pr-[24px]">
                <ContactRow icon="mail" label="By email">
                  <p className="mt-[8px] text-[20px] font-medium" style={{ color: DEEP }}>
                    george.washington@vantaca.com
                  </p>
                  <p className="mt-[6px] text-[16px] leading-[1.55]" style={{ color: BODY }}>
                    Send a message any time. We'll respond within one business day.
                  </p>
                </ContactRow>
                <ContactRow icon="phone" label="By phone">
                  <p className="mt-[8px] text-[20px] font-medium" style={{ color: DEEP }}>
                    (239) 555-0142
                  </p>
                  <p className="mt-[6px] text-[16px] leading-[1.55]" style={{ color: BODY }}>
                    Speak with your community management team during business hours.
                  </p>
                </ContactRow>
                <ContactRow icon="clock" label="Office hours">
                  <p className="mt-[8px] text-[16px] leading-[1.55]" style={{ color: BODY }}>
                    Monday – Friday, 8:00 am – 5:00 pm
                  </p>
                </ContactRow>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="px-[27px] pt-[56px] pb-[36px]" style={{ background: "#1f3033" }}>
            <div className={CONTENT}>
              <div className="flex flex-wrap items-center justify-between gap-[32px]">
                <div className="flex items-center gap-[24px]">
                  <img src={imgLogo} alt="Presidential Valley" className="w-[96px]" />
                  <div className="border-l border-white/15 pl-[24px] text-[14px] leading-[1.6]">
                    <p className="font-semibold text-white">Professionally managed</p>
                    <p className="text-white/65">george.washington@vantaca.com</p>
                  </div>
                </div>
                <nav className="flex flex-wrap gap-[32px] text-[15px] font-medium text-white/85">
                  {FOOTER_LINKS.map((link) => (
                    <span key={link}>{link}</span>
                  ))}
                </nav>
              </div>
              <div className="mt-[40px] flex flex-wrap justify-between gap-[20px] border-t border-white/15 pt-[24px] text-[13px] text-white/55">
                <span>© 2026 Presidential Valley. All rights reserved.</span>
                <span className="flex gap-[24px]">
                  <span>Privacy Policy</span>
                  <span>Terms of Service</span>
                </span>
              </div>
            </div>
          </footer>
        </div>
      )}
    </div>
  );
}
