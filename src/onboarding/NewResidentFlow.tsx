import { useState } from "react";
import { Check, UserPlus, RefreshCw, Eye, EyeOff } from "lucide-react";
import svgPaths from "@/imports/NewAccount/svg-0it9rwg11a";
import imgWordmark from "@/assets/Branding.svg";
import imgCreditCardSelected from "@/imports/credit-card.png";
import imgCreditCardUnselected from "@/imports/credit-card_unselected.png";
import imgBankSelected from "@/imports/bank_selected.png";
import imgBankUnselected from "@/imports/bank.png";

// ─── Types ────────────────────────────────────────────────────────────────────

type Screen = "account" | "confirm" | "autopay" | "done";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirm: string;
  autoPayEnabled: boolean;
  paymentMethod: "card" | "ach";
  cardName: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  bankName: string;
  routingNumber: string;
  accountNumber: string;
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const STEPS = [
  { number: 1, icon: UserPlus,   title: "Account creation", description: "Set up your resident login",        screens: ["account", "confirm"] },
  { number: 2, icon: RefreshCw,  title: "Set Up AutoPay",   description: "Schedule automatic payments",  screens: ["autopay"] },
] as const;

function screenToStep(screen: Screen): number {
  if (screen === "account") return 1;
  if (screen === "confirm" || screen === "autopay") return 2;
  return 2;
}

type StepState = "complete" | "active" | "upcoming";

function StepItem({
  step,
  state,
  onClick,
}: {
  step: (typeof STEPS)[number];
  state: StepState;
  onClick?: () => void;
}) {
  const Icon = step.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={state === "upcoming"}
      data-ux-id={`onboarding-step-${step.number}`}
      className={[
        "flex items-start gap-3 w-full text-left px-4 py-3 rounded-xl transition-colors",
        state === "active"   ? "bg-white shadow-sm" : "",
        state === "complete" ? "cursor-pointer hover:bg-white/70" : "",
        state === "upcoming" ? "opacity-40 cursor-default" : "",
      ].join(" ")}
    >
      <div
        className={[
          "mt-0.5 flex items-center justify-center shrink-0 size-7 rounded-full transition-colors",
          state === "complete" ? "bg-[#247ae4] text-white" :
          state === "active"   ? "bg-[#247ae4] text-white" :
                                 "bg-[#e5eaf0] text-[#7a8899]",
        ].join(" ")}
      >
        {state === "complete"
          ? <Check className="size-3.5 stroke-[2.5]" />
          : <Icon className="size-3.5" />}
      </div>
      <div className="flex flex-col gap-0.5">
        <span
          className={["text-[13px] font-semibold leading-tight", state === "active" ? "text-[#262630]" : "text-[#4b5563]"].join(" ")}
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {step.title}
        </span>
        <span className="text-[11px] text-[#9ca3af] leading-tight" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          {step.description}
        </span>
      </div>
    </button>
  );
}

function Sidebar({ screen, skipped, onStep, onBypass }: { screen: Screen; skipped: boolean; onStep: (s: Screen) => void; onBypass: () => void }) {
  const current = screenToStep(screen);
  const total = STEPS.length;

  return (
    <aside data-ux-id="onboarding-sidebar" className="w-64 shrink-0 hidden md:flex flex-col gap-6 bg-[#f5f7fa] border-r border-[#e5eaf0] px-4 py-8">
      {/* Logo */}
      <button
        type="button"
        onClick={onBypass}
        data-ux-id="onboarding-logo-bypass"
        className="px-1 mb-2 self-start cursor-pointer"
        aria-label="Skip to dashboard"
      >
        <img src={imgWordmark} alt="Waterfront Community Estates" className="object-contain" style={{ height: "54px" }} />
      </button>

      {/* Progress */}
      <div className="px-1">
        <p
          className="text-[11px] font-semibold uppercase tracking-widest text-[#a0aab4] mb-3"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Step {screen === "done" ? total : current} of {total}
        </p>
        <div className="h-1 rounded-full bg-[#dde3ea] overflow-hidden">
          <div
            className="h-full rounded-full bg-[#247ae4] transition-all duration-500"
            style={{ width: `${((screen === "done" ? total : current) / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <nav className="flex flex-col gap-1">
        {STEPS.map((step) => {
          const activeStep = screen === "done" ? 4 : current;
          const isSkippedStep = skipped && step.number === 2 && screen === "done";
          const state: StepState =
            isSkippedStep ? "active" :
            step.number < activeStep ? "complete" :
            step.number === activeStep ? "active" : "upcoming";
          return (
            <StepItem
              key={step.number}
              step={step}
              state={state}
              onClick={() => {
                if (state === "complete") {
                  if (step.number === 1) onStep("account");
                }
              }}
            />
          );
        })}
      </nav>
    </aside>
  );
}

// ─── Shared components ────────────────────────────────────────────────────────

function Field({
  label, type = "text", placeholder, value, onChange, autoComplete, maxLength, uxId,
}: {
  label: string; type?: string; placeholder?: string; value: string;
  onChange: (v: string) => void; autoComplete?: string; maxLength?: number; uxId: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-[#262630] text-[13px] font-semibold" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        {label}
      </label>
      <input
        type={type} placeholder={placeholder ?? label} value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete} maxLength={maxLength}
        data-ux-id={uxId}
        className="w-full h-[44px] px-4 text-[15px] text-[#262630] placeholder:text-[#9ca3af] rounded-[6px] border border-[#e0e0e0] bg-white outline-none focus:border-[#247ae4] focus:ring-2 focus:ring-[#247ae4]/10 transition-all"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="size-5 shrink-0" fill="none" viewBox="0 0 24 24">
      <path clipRule="evenodd" d={svgPaths.p2c309900} fill="#4285F4" fillRule="evenodd" />
      <path clipRule="evenodd" d={svgPaths.p5439c80}  fill="#34A853" fillRule="evenodd" />
      <path clipRule="evenodd" d={svgPaths.p3b443800} fill="#FBBC05" fillRule="evenodd" />
      <path clipRule="evenodd" d={svgPaths.p39a0e280} fill="#EA4335" fillRule="evenodd" />
    </svg>
  );
}

function PageHeading({ step, total, title, subtitle }: { step: number; total: number; title: string; subtitle: string }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-[12px] font-semibold text-[#247ae4] tracking-widest uppercase" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        Step {step} of {total}
      </p>
      <h1 className="text-[26px] font-semibold text-[#262630] leading-tight" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        {title}
      </h1>
      <p className="text-[13px] text-[#6b7280] leading-relaxed" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        {subtitle}
      </p>
    </div>
  );
}

// ─── Password field with show/hide toggle ────────────────────────────────────

function PasswordField({ label, value, onChange, uxId }: { label: string; value: string; onChange: (v: string) => void; uxId: string }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-[#262630] text-[13px] font-semibold" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        {label}
      </label>
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          placeholder="Password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="new-password"
          data-ux-id={uxId}
          className="w-full h-[44px] px-4 pr-11 text-[15px] text-[#262630] placeholder:text-[#9ca3af] rounded-[6px] border border-[#e0e0e0] bg-white outline-none focus:border-[#247ae4] focus:ring-2 focus:ring-[#247ae4]/10 transition-all"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          data-ux-id={`${uxId}-visibility-toggle`}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#6b7280] transition-colors cursor-pointer"
          tabIndex={-1}
        >
          {visible ? <EyeOff className="size-4.5" /> : <Eye className="size-4.5" />}
        </button>
      </div>
    </div>
  );
}

// ─── Step 1: Account Creation ─────────────────────────────────────────────────

function StepAccount({ data, onChange, onNext }: { data: FormData; onChange: (k: keyof FormData, v: string) => void; onNext: () => void }) {

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onNext();
  }

  return (
    <div className="flex flex-col gap-6 max-w-[440px] w-full">
      <PageHeading step={1} total={2} title="Create New Account" subtitle="Set up your new resident portal login." />

      <div className="bg-[#f5f7fa] rounded-lg px-4 py-3 flex flex-col gap-0.5 border border-[#e5eaf0]">
        <p className="text-[11px] font-semibold text-[#a0aab4] uppercase tracking-widest" style={{ fontFamily: "'DM Sans', sans-serif" }}>Property Address</p>
        <p className="text-[13px] text-[#262630]" style={{ fontFamily: "'DM Sans', sans-serif" }}>5201 North Roxboro St. · Durham, NC 27704-1825</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex gap-4">
          <Field label="First Name" value={data.firstName} onChange={(v) => onChange("firstName", v)} autoComplete="given-name" uxId="onboarding-account-first-name-input" />
          <Field label="Last Name" value={data.lastName} onChange={(v) => onChange("lastName", v)} autoComplete="family-name" uxId="onboarding-account-last-name-input" />
        </div>
        <Field label="Email" type="email" value={data.email} onChange={(v) => onChange("email", v)} autoComplete="email" uxId="onboarding-account-email-input" />
        <PasswordField label="Create your Password" value={data.password} onChange={(v) => onChange("password", v)} uxId="onboarding-account-password-input" />

        <button type="submit" data-ux-id="onboarding-account-create-button" className="w-full mt-1 bg-[#247ae4] hover:bg-[#1d6fd4] active:bg-[#1a63bf] text-white text-[14px] font-semibold rounded-[8px] px-4 py-3 transition-colors cursor-pointer" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          Create Account
        </button>
      </form>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-[#e5eaf0]" />
        <span className="text-[13px] text-[#a0aab4]" style={{ fontFamily: "'DM Sans', sans-serif" }}>or continue with</span>
        <div className="flex-1 h-px bg-[#e5eaf0]" />
      </div>

      <button type="button" data-ux-id="onboarding-account-google-button" className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-full border-2 border-[#e2e8f0] bg-white hover:bg-slate-50 transition-colors cursor-pointer">
        <GoogleIcon />
        <span className="text-[#1e293b] text-[15px] font-medium" style={{ fontFamily: "'DM Sans', sans-serif" }}>Continue with Google</span>
      </button>

      <p className="text-[11px] text-[#9ca3af] text-center leading-relaxed" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        By clicking continue, you agree to our{" "}
        <a href="#" className="text-[#247ae4] hover:underline">Terms &amp; Conditions</a>{" "}and{" "}
        <a href="#" className="text-[#247ae4] hover:underline">Privacy Policy</a>
      </p>
    </div>
  );
}

// ─── Confirmation screen ──────────────────────────────────────────────────────

function ScreenConfirm({ data, onChange, onEnable, onSkip }: { data: FormData; onChange: (k: keyof FormData, v: string | boolean) => void; onEnable: () => void; onSkip: () => void }) {
  return (
    <div className="flex flex-col gap-8 max-w-[440px] w-full">

      {/* Welcome banner */}
      <div data-ux-id="onboarding-confirm-welcome-banner" className="flex items-center gap-4 py-4 px-5 bg-[#f0faf4] border border-[#bbf0d0] rounded-xl">
        <div className="size-9 rounded-full bg-[#22c55e] flex items-center justify-center shrink-0">
          <Check className="size-4.5 text-white stroke-[2.5]" />
        </div>
        <div className="flex flex-col gap-0.5">
          <p className="text-[15px] font-semibold text-[#262630] leading-tight" style={{ fontFamily: "'DM Sans', sans-serif" }}>Welcome</p>
          <p className="text-[12px] text-[#4b5563] leading-snug" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Your account has been successfully created. A new resident welcome email has been sent to your email address.
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-[#e5eaf0]" />
        <span className="text-[11px] font-semibold text-[#a0aab4] uppercase tracking-widest" style={{ fontFamily: "'DM Sans', sans-serif" }}>Next step</span>
        <div className="flex-1 h-px bg-[#e5eaf0]" />
      </div>

      {/* AutoPay inline */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <p className="text-[12px] font-semibold text-[#247ae4] tracking-widest uppercase" style={{ fontFamily: "'DM Sans', sans-serif" }}>Step 2 of 2</p>
          <h2 className="text-[20px] font-semibold text-[#262630] leading-tight" style={{ fontFamily: "'DM Sans', sans-serif" }}>Set Up AutoPay</h2>
          <p className="text-[13px] text-[#6b7280]" style={{ fontFamily: "'DM Sans', sans-serif" }}>Automatically pay your HOA dues in full each scheduled period.</p>
          <p className="text-[13px] text-[#6b7280]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Your first payment start date will be <strong className="text-[#262630]">August 1, 2026</strong>.
          </p>
        </div>

        <AutoPayFields data={data} onChange={onChange} onEnable={onEnable} onSkip={onSkip} uxPrefix="onboarding-confirm-autopay" />
      </div>
    </div>
  );
}

// ─── Shared AutoPay form body ─────────────────────────────────────────────────

function AutoPayFields({ data, onChange, onEnable, onSkip, uxPrefix }: {
  data: FormData;
  onChange: (k: keyof FormData, v: string | boolean) => void;
  onEnable: () => void;
  onSkip: () => void;
  uxPrefix: string;
}) {
  function formatCard(v: string) { return v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim(); }
  function formatExpiry(v: string) { const d = v.replace(/\D/g, "").slice(0, 4); return d.length >= 3 ? d.slice(0, 2) + "/" + d.slice(2) : d; }

  return (
    <div className="flex flex-col gap-5">
      {/* Payment method tabs */}
      <div className="flex gap-3">
        {([
          ["card", imgCreditCardSelected, imgCreditCardUnselected, "Credit Card"],
          ["ach",  imgBankSelected,       imgBankUnselected,       "Bank Account"],
        ] as const).map(([id, selectedIcon, unselectedIcon, label]) => {
          const isSelected = data.paymentMethod === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange("paymentMethod", id)}
              data-ux-id={`${uxPrefix}-method-${id}`}
              className={["flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 text-[13px] font-semibold transition-all cursor-pointer", isSelected ? "border-[#247ae4] bg-[#247ae4]/5 text-[#247ae4]" : "border-[#e5eaf0] bg-white text-[#4b5563] hover:border-[#bccfea]"].join(" ")}
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              <img src={isSelected ? selectedIcon : unselectedIcon} alt={label} className="size-5 object-contain" />
              {label}
            </button>
          );
        })}
      </div>

      {/* Payment fields */}
      {data.paymentMethod === "card" ? (
        <div className="flex flex-col gap-3">
          <Field label="Name on Card" placeholder="Full name" value={data.cardName} onChange={(v) => onChange("cardName", v)} autoComplete="cc-name" uxId={`${uxPrefix}-card-name-input`} />
          <div className="flex flex-col gap-1.5">
            <label className="text-[#262630] text-[13px] font-semibold" style={{ fontFamily: "'DM Sans', sans-serif" }}>Card Number</label>
            <input type="text" inputMode="numeric" placeholder="1234 5678 9012 3456" value={data.cardNumber} onChange={(e) => onChange("cardNumber", formatCard(e.target.value))} autoComplete="cc-number" data-ux-id={`${uxPrefix}-card-number-input`} className="w-full h-[44px] px-4 text-[15px] text-[#262630] placeholder:text-[#9ca3af] rounded-[6px] border border-[#e0e0e0] bg-white outline-none focus:border-[#247ae4] focus:ring-2 focus:ring-[#247ae4]/10 transition-all tracking-wider" style={{ fontFamily: "'DM Sans', sans-serif" }} />
          </div>
          <div className="flex gap-3">
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-[#262630] text-[13px] font-semibold" style={{ fontFamily: "'DM Sans', sans-serif" }}>Expiry</label>
              <input type="text" inputMode="numeric" placeholder="MM/YY" value={data.expiry} onChange={(e) => onChange("expiry", formatExpiry(e.target.value))} autoComplete="cc-exp" maxLength={5} data-ux-id={`${uxPrefix}-card-expiry-input`} className="w-full h-[44px] px-4 text-[15px] text-[#262630] placeholder:text-[#9ca3af] rounded-[6px] border border-[#e0e0e0] bg-white outline-none focus:border-[#247ae4] focus:ring-2 focus:ring-[#247ae4]/10 transition-all" style={{ fontFamily: "'DM Sans', sans-serif" }} />
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-[#262630] text-[13px] font-semibold" style={{ fontFamily: "'DM Sans', sans-serif" }}>CVV</label>
              <input type="text" inputMode="numeric" placeholder="123" value={data.cvv} onChange={(e) => onChange("cvv", e.target.value.replace(/\D/g, "").slice(0, 4))} autoComplete="cc-csc" maxLength={4} data-ux-id={`${uxPrefix}-card-cvv-input`} className="w-full h-[44px] px-4 text-[15px] text-[#262630] placeholder:text-[#9ca3af] rounded-[6px] border border-[#e0e0e0] bg-white outline-none focus:border-[#247ae4] focus:ring-2 focus:ring-[#247ae4]/10 transition-all" style={{ fontFamily: "'DM Sans', sans-serif" }} />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <Field label="Bank Name" placeholder="e.g. Chase, Bank of America" value={data.bankName} onChange={(v) => onChange("bankName", v)} uxId={`${uxPrefix}-bank-name-input`} />
          <Field label="Routing Number" placeholder="9-digit routing number" value={data.routingNumber} onChange={(v) => onChange("routingNumber", v.replace(/\D/g, "").slice(0, 9))} maxLength={9} uxId={`${uxPrefix}-bank-routing-input`} />
          <Field label="Account Number" placeholder="Account number" value={data.accountNumber} onChange={(v) => onChange("accountNumber", v.replace(/\D/g, "").slice(0, 17))} maxLength={17} uxId={`${uxPrefix}-bank-account-input`} />
        </div>
      )}

      {/* Buttons */}
      <div className="flex flex-col gap-2 pt-1">
        <button
          type="button"
          onClick={onEnable}
          data-ux-id={`${uxPrefix}-enroll-button`}
          className="w-full bg-[#247ae4] hover:bg-[#1d6fd4] active:bg-[#1a63bf] text-white text-[14px] font-semibold rounded-[8px] px-4 py-3 transition-colors cursor-pointer"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Enroll in AutoPay
        </button>
        <button
          type="button"
          onClick={onSkip}
          data-ux-id={`${uxPrefix}-skip-button`}
          className="w-full bg-[#f3f4f6] hover:bg-[#e5e7eb] text-[#6b7280] text-[14px] font-semibold rounded-[8px] px-4 py-3 transition-colors cursor-pointer"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}

// ─── Step 2: AutoPay ─────────────────────────────────────────────────────────

function StepAutoPay({ data, onChange, onFinish, onSkip }: {
  data: FormData; onChange: (k: keyof FormData, v: string | boolean) => void; onBack: () => void; onFinish: () => void; onSkip: () => void;
}) {
  return (
    <div className="flex flex-col gap-6 max-w-[440px] w-full">
      <PageHeading step={2} total={2} title="Set Up AutoPay" subtitle="Automatically pay your HOA dues in full each scheduled period." />
      <p className="text-[13px] text-[#6b7280] -mt-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        Your first payment start date will be <strong className="text-[#262630]">August 1, 2026</strong>.
      </p>
      <AutoPayFields data={data} onChange={onChange} onEnable={onFinish} onSkip={onSkip} uxPrefix="onboarding-autopay" />
    </div>
  );
}

// ─── Done ─────────────────────────────────────────────────────────────────────

function ScreenDone({ data, skipped, onPortal }: { data: FormData; skipped: boolean; onPortal: () => void }) {
  return (
    <div className="flex flex-col items-center gap-6 w-[480px] text-center">
      <div className="size-16 rounded-full bg-[#247ae4]/10 flex items-center justify-center">
        <Check className="size-8 text-[#247ae4] stroke-[2]" />
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="text-[26px] font-semibold text-[#262630]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          {data.firstName ? `You're all set, ${data.firstName}!` : "You're all set!"}
        </h1>
        <p className="text-[14px] text-[#6b7280] leading-relaxed" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          Your resident account is ready.
          {!skipped && " AutoPay is enabled — your HOA dues will be paid automatically on scheduled due dates."}
        </p>
      </div>

      <div data-ux-id="onboarding-done-summary" className="w-full bg-[#f5f7fa] border border-[#e5eaf0] rounded-xl px-5 py-4 text-left flex flex-col gap-3">
        {[
          { label: "Account No.", value: "PCV-00421" },
          { label: "Property", value: "5201 North Roxboro St." },
          { label: "AutoPay", value: skipped ? "Not Enabled" : "Enabled" },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-[12px] font-semibold text-[#a0aab4] uppercase tracking-wider" style={{ fontFamily: "'DM Sans', sans-serif" }}>{label}</span>
            <span className="text-[13px] text-[#262630]" style={{ fontFamily: "'DM Sans', sans-serif" }}>{value}</span>
          </div>
        ))}
      </div>

      <button type="button" onClick={onPortal} data-ux-id="onboarding-done-go-to-portal-button" className="w-full bg-[#247ae4] hover:bg-[#1d6fd4] text-white text-[14px] font-semibold rounded-[8px] px-6 py-3 transition-colors cursor-pointer" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        Go to my portal
      </button>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

const INITIAL: FormData = {
  firstName: "Alex", lastName: "Johnson", email: "alex.johnson@email.com", password: "", confirm: "",
  autoPayEnabled: true,
  paymentMethod: "card",
  cardName: "", cardNumber: "", expiry: "", cvv: "",
  bankName: "", routingNumber: "", accountNumber: "",
};

export default function NewResidentFlow({ onComplete }: { onComplete: () => void }) {
  const [screen, setScreen] = useState<Screen>("account");
  const [skipped, setSkipped] = useState(false);
  const [data, setData] = useState<FormData>(INITIAL);

  function change(k: keyof FormData, v: string | boolean) {
    setData((d) => ({ ...d, [k]: v }));
  }

  return (
    <div data-ux-id="onboarding-flow" className="min-h-screen w-full flex bg-white">
      <Sidebar screen={screen} skipped={skipped} onStep={(s) => setScreen(s)} onBypass={onComplete} />
      <main className="flex-1 flex flex-col items-center px-8 py-12 bg-white overflow-y-auto">
        {/* Mobile-only logo */}
        <div className="md:hidden self-start mb-8">
          <button
            type="button"
            onClick={onComplete}
            data-ux-id="onboarding-mobile-logo-bypass"
            className="cursor-pointer"
            aria-label="Skip to dashboard"
          >
            <img src={imgWordmark} alt="Waterfront Community Estates" className="object-contain" style={{ height: "48px" }} />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center w-full">
        {screen === "account"  && <StepAccount   data={data} onChange={(k, v) => change(k, v)} onNext={() => setScreen("confirm")} />}
        {screen === "confirm"  && <ScreenConfirm data={data} onChange={change} onEnable={() => { setSkipped(false); setScreen("done"); }} onSkip={() => { setSkipped(true); setScreen("done"); }} />}
        {screen === "autopay"  && <StepAutoPay   data={data} onChange={change} onBack={() => setScreen("confirm")} onFinish={() => { setSkipped(false); setScreen("done"); }} onSkip={() => { setSkipped(true); setScreen("done"); }} />}
        {screen === "done"     && <ScreenDone    data={data} skipped={skipped} onPortal={onComplete} />}
        </div>
      </main>
    </div>
  );
}
