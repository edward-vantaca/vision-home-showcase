import imgScreenshot20260109At35226Pm2 from "./063c77a73d7a5b37f3ddd4ce1a5425c6960bdf9b.png";
import { imgScreenshot20260109At35226Pm1 } from "./svg-9a9bp";
type FilterChipProps = {
  className?: string;
  selected?: boolean;
  state?: "passive" | "urgent";
};

function FilterChip({ className, selected = true, state = "passive" }: FilterChipProps) {
  const isNotSelectedAndPassive = !selected && state === "passive";
  const isNotSelectedAndUrgent = !selected && state === "urgent";
  return (
    <div className={className || `relative rounded-[50px] ${isNotSelectedAndUrgent ? "bg-[#ffefef]" : isNotSelectedAndPassive ? "bg-[#dfeaf0]" : "bg-[#247ae4]"}`}>
      <div className="content-stretch flex gap-[10px] items-start pl-[15px] pr-[7px] py-[8px] relative size-full">
        <p className={`[word-break:break-word] font-["DM_Sans:SemiBold",sans-serif] font-semibold leading-[normal] relative shrink-0 text-[14px] whitespace-nowrap ${!selected ? "text-[#262630]" : "text-white"}`} style={{ fontVariationSettings: '"opsz" 14' }}>
          All
        </p>
        <div className={`content-stretch flex flex-col items-center justify-center relative rounded-[50px] shrink-0 size-[19px] ${isNotSelectedAndUrgent ? "bg-[#f11111]" : isNotSelectedAndPassive ? "bg-white" : "bg-[rgba(255,255,255,0.3)]"}`} data-name="Count">
          <p className={`[word-break:break-word] font-["DM_Sans:SemiBold",sans-serif] font-semibold leading-[normal] relative shrink-0 text-[13px] text-center whitespace-nowrap ${isNotSelectedAndPassive ? "text-[#262630]" : "text-white"}`} style={{ fontVariationSettings: '"opsz" 14' }}>
            21
          </p>
        </div>
      </div>
    </div>
  );
}

function Branding() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-col items-center leading-[0] relative shrink-0 w-[165.907px]" data-name="Branding">
      <div className="flex flex-col font-['Font_Awesome_6_Pro:Light',sans-serif] justify-center not-italic relative shrink-0 text-[#1a8ffb] text-[41.263px] tracking-[-0.4126px] whitespace-nowrap">
        <p className="leading-[normal]">{`\uF74F`}</p>
      </div>
      <div className="flex flex-col font-['Lexend:Regular',sans-serif] font-normal h-[29.27px] justify-center relative shrink-0 text-[#043b59] text-[19.514px] tracking-[0.1951px] uppercase w-[138.221px]">
        <p className="leading-[normal]">Waterfront</p>
      </div>
      <div className="flex flex-col font-['Lexend:Regular',sans-serif] font-normal justify-center relative shrink-0 text-[#043b59] text-[9.757px] tracking-[-0.0976px] uppercase whitespace-nowrap">
        <p className="leading-[normal]">Community Estates</p>
      </div>
    </div>
  );
}

function Frame12() {
  return (
    <div className="content-stretch flex gap-[10px] items-center justify-center px-[23px] py-[12px] relative rounded-[8px] shrink-0">
      <div aria-hidden className="absolute border border-[#247ae4] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <p className="[word-break:break-word] font-['Font_Awesome_6_Pro:Solid',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#247ae4] text-[14px] text-center whitespace-nowrap">+</p>
      <p className="[word-break:break-word] font-['DM_Sans:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#247ae4] text-[14px] text-center whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>
        Quick Actions
      </p>
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center p-[4px] relative shrink-0 size-[24px]">
      <p className="[word-break:break-word] font-['Font_Awesome_7_Pro:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#262630] text-[15px] whitespace-nowrap">{`\uF01C`}</p>
    </div>
  );
}

function Count() {
  return (
    <div className="bg-[#247ae4] content-stretch flex flex-col items-center justify-center relative rounded-[50px] shrink-0 w-[16px]" data-name="Count">
      <p className="[word-break:break-word] font-['DM_Sans:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[12px] text-center text-white whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>
        3
      </p>
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center p-[4px] relative shrink-0 size-[24px]">
      <p className="[word-break:break-word] font-['Font_Awesome_6_Pro:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#262630] text-[16px] whitespace-nowrap">house</p>
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center p-[4px] relative shrink-0 size-[24px]">
      <p className="[word-break:break-word] font-['Font_Awesome_7_Pro:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#262630] text-[15px] whitespace-nowrap">{`\uF09D`}</p>
    </div>
  );
}

function Frame4() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center p-[4px] relative shrink-0 size-[24px]">
      <p className="[word-break:break-word] font-['Font_Awesome_7_Pro:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#262630] text-[17px] text-center whitespace-nowrap">{`\uF2BB`}</p>
    </div>
  );
}

function Frame5() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center p-[4px] relative shrink-0 size-[24px]">
      <p className="[word-break:break-word] font-['Font_Awesome_7_Pro:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#262630] text-[15px] whitespace-nowrap">{`\uF1D8`}</p>
    </div>
  );
}

function Frame6() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center p-[4px] relative shrink-0 size-[24px]">
      <p className="[word-break:break-word] font-['Font_Awesome_6_Pro:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#262630] text-[17px] whitespace-nowrap">{`\uF07B`}</p>
    </div>
  );
}

function Frame7() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center p-[4px] relative shrink-0 size-[24px]">
      <p className="[word-break:break-word] font-['Font_Awesome_7_Pro:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#262630] text-[15px] whitespace-nowrap">{`\uF2B9`}</p>
    </div>
  );
}

function Frame8() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center p-[4px] relative shrink-0 size-[24px]">
      <p className="[word-break:break-word] font-['Font_Awesome_7_Pro:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#262630] text-[17px] text-center whitespace-nowrap">{`\uF073`}</p>
    </div>
  );
}

function Frame42() {
  return (
    <div className="h-0 relative shrink-0 w-full">
      <div className="absolute inset-[-1px_0_0_0]">
        <svg className="block size-full" fill="none" height="1" preserveAspectRatio="none" viewBox="0 0 213 1" width="213">
          <g id="Frame 43">
            <line id="Line 1" stroke="#D9E7F0" x2="213" y1="0.5" y2="0.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Frame9() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center p-[4px] relative shrink-0 size-[24px]">
      <p className="[word-break:break-word] font-['Font_Awesome_7_Pro:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#262630] text-[17px] text-center whitespace-nowrap">{`\uF2BB`}</p>
    </div>
  );
}

function Frame35() {
  return (
    <div className="content-stretch flex flex-col gap-[5px] items-start relative shrink-0 w-full">
      <div className="h-[28px] relative rounded-[8px] shrink-0" data-name="Nav Item">
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex gap-[12px] items-center px-[10px] py-[8px] relative size-full">
            <Frame9 />
            <p className="[word-break:break-word] font-['DM_Sans:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[#262630] text-[14px] whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>
              My Profile
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame10() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center p-[4px] relative shrink-0 size-[24px]">
      <p className="[word-break:break-word] font-['Font_Awesome_7_Pro:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#262630] text-[17px] text-center whitespace-nowrap">{`\uF08B`}</p>
    </div>
  );
}

function Frame36() {
  return (
    <div className="content-stretch flex flex-col gap-[5px] h-[28px] items-start relative shrink-0 w-full">
      <div className="h-[36px] relative rounded-[8px] shrink-0 w-[108px]" data-name="Nav Item">
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex gap-[12px] items-center px-[10px] py-[8px] relative size-full">
            <Frame10 />
            <p className="[word-break:break-word] font-['DM_Sans:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[#262630] text-[14px] whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>
              Log Out
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame43() {
  return (
    <div className="content-stretch flex flex-col gap-[13px] items-start justify-center relative shrink-0 w-full">
      <Frame35 />
      <Frame36 />
    </div>
  );
}

function Frame33() {
  return (
    <div className="content-stretch flex flex-col gap-[22px] items-center relative shrink-0 w-full">
      <Frame42 />
      <Frame43 />
    </div>
  );
}

function Frame34() {
  return (
    <div className="content-stretch flex flex-col gap-[13px] items-start relative shrink-0 w-full">
      <div className="relative rounded-[8px] shrink-0 w-full" data-name="Nav Item">
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex gap-[12px] items-center pl-[10px] pr-[22px] py-[8px] relative size-full">
            <Frame />
            <p className="[word-break:break-word] flex-[1_0_0] font-['DM_Sans:Medium',sans-serif] font-medium leading-[normal] min-w-px relative text-[#262630] text-[14px]" style={{ fontVariationSettings: '"opsz" 14' }}>
              Inbox
            </p>
            <Count />
          </div>
        </div>
      </div>
      <div className="relative rounded-[8px] shrink-0 w-full" data-name="Nav Item">
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex gap-[12px] items-center pl-[10px] pr-[22px] py-[8px] relative size-full">
            <Frame1 />
            <p className="[word-break:break-word] font-['DM_Sans:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[#262630] text-[14px] whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>
              Home
            </p>
          </div>
        </div>
      </div>
      <div className="relative rounded-[8px] shrink-0 w-full" data-name="Nav Item">
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex gap-[12px] items-center pl-[10px] pr-[22px] py-[8px] relative size-full">
            <Frame3 />
            <p className="[word-break:break-word] font-['DM_Sans:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[#262630] text-[14px] whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>
              Payments
            </p>
          </div>
        </div>
      </div>
      <div className="relative rounded-[8px] shrink-0 w-full" data-name="Nav Item">
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex gap-[12px] items-center pl-[10px] pr-[22px] py-[8px] relative size-full">
            <Frame4 />
            <p className="[word-break:break-word] font-['DM_Sans:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[#262630] text-[14px] whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>
              Community Feed
            </p>
          </div>
        </div>
      </div>
      <div className="relative rounded-[8px] shrink-0 w-full" data-name="Nav Item">
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex gap-[12px] items-center pl-[10px] pr-[22px] py-[8px] relative size-full">
            <Frame5 />
            <p className="[word-break:break-word] font-['DM_Sans:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[#262630] text-[14px] whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>
              Requests
            </p>
          </div>
        </div>
      </div>
      <div className="bg-[#fffefe] relative rounded-[8px] shrink-0 w-full" data-name="Nav Item">
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex gap-[12px] items-center pl-[10px] pr-[22px] py-[8px] relative size-full">
            <Frame6 />
            <p className="[word-break:break-word] font-['DM_Sans:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[#262630] text-[14px] whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>
              Documents
            </p>
          </div>
        </div>
      </div>
      <div className="relative rounded-[8px] shrink-0 w-full" data-name="Nav Item">
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex gap-[12px] items-center pl-[10px] pr-[22px] py-[8px] relative size-full">
            <Frame7 />
            <p className="[word-break:break-word] font-['DM_Sans:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[#262630] text-[14px] whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>
              Directory
            </p>
          </div>
        </div>
      </div>
      <div className="relative rounded-[8px] shrink-0 w-full" data-name="Nav Item">
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex gap-[12px] items-center pl-[10px] pr-[22px] py-[8px] relative size-full">
            <Frame8 />
            <p className="[word-break:break-word] font-['DM_Sans:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[#262630] text-[14px] whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>
              Calendar
            </p>
          </div>
        </div>
      </div>
      <Frame33 />
    </div>
  );
}

function Frame2() {
  return (
    <div className="flex flex-row items-center self-stretch">
      <div className="bg-white h-full relative shrink-0 w-[265px]">
        <div className="flex flex-col items-center overflow-clip rounded-[inherit] size-full">
          <div className="content-stretch flex flex-col gap-[42px] items-center px-[26px] py-[40px] relative size-full">
            <Branding />
            <Frame12 />
            <Frame34 />
          </div>
        </div>
        <div aria-hidden className="absolute border-[#d9ecf8] border-r border-solid inset-0 pointer-events-none" />
      </div>
    </div>
  );
}

function Frame16() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col items-start leading-[normal] min-w-px relative text-[#262630] whitespace-nowrap">
      <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold relative shrink-0 text-[28px]" style={{ fontVariationSettings: '"opsz" 14' }}>
        Dashboard
      </p>
      <p className="font-['DM_Sans:Regular',sans-serif] font-normal opacity-70 relative shrink-0 text-[16px]" style={{ fontVariationSettings: '"opsz" 14' }}>
        The latest and greatest from your community
      </p>
    </div>
  );
}

function MaskGroup() {
  return (
    <div className="absolute contents left-0 top-0" data-name="Mask group">
      <div className="absolute h-[127px] left-[-48px] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[48px_42px] mask-size-[52px_52px] top-[-42px] w-[128px]" style={{ maskImage: `url("${imgScreenshot20260109At35226Pm1}")` }} data-name="Screenshot 2026-01-09 at 3.52.26 PM 1">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgScreenshot20260109At35226Pm2} />
      </div>
    </div>
  );
}

function Frame15() {
  return (
    <div className="relative shrink-0 size-[52px]">
      <MaskGroup />
      <p className="[word-break:break-word] absolute font-['Font_Awesome_7_Pro:Solid',sans-serif] leading-[normal] left-[15px] not-italic text-[#f03434] text-[27px] top-[12px] whitespace-nowrap">{`\uF3C5`}</p>
    </div>
  );
}

function Frame17() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[3px] items-start min-w-px relative text-[#262630]">
      <p className="font-['DM_Sans:Bold',sans-serif] font-bold leading-[normal] relative shrink-0 text-[16px] w-full" style={{ fontVariationSettings: '"opsz" 14' }}>
        Madison Green
      </p>
      <div className="font-['DM_Sans:Medium',sans-serif] font-medium leading-[0] opacity-65 relative shrink-0 text-[14px] w-full" style={{ fontVariationSettings: '"opsz" 14' }}>
        <p className="leading-[16px] mb-0">151225 77th Rd N</p>
        <p className="leading-[16px]">Loxahatchee, FL 33470</p>
      </div>
    </div>
  );
}

function Frame14() {
  return (
    <div className="bg-white content-stretch drop-shadow-[0px_2px_9px_rgba(18,17,48,0.09)] flex gap-[13px] items-center pl-[15px] pr-[21px] py-[12px] relative rounded-[18px] shrink-0 w-[380px]">
      <Frame15 />
      <Frame17 />
      <p className="[word-break:break-word] font-['Font_Awesome_7_Pro:Solid',sans-serif] leading-[16px] not-italic relative shrink-0 text-[#262630] text-[20px] whitespace-nowrap">{`\uF078`}</p>
    </div>
  );
}

function Frame37() {
  return (
    <div className="content-stretch flex gap-[26px] items-center relative shrink-0">
      <Frame14 />
    </div>
  );
}

function Frame13() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full">
      <Frame16 />
      <Frame37 />
    </div>
  );
}

function Frame38() {
  return (
    <div className="bg-white h-[59px] relative rounded-[18px] shadow-[0px_2px_18px_0px_rgba(18,17,48,0.07)] shrink-0 w-full">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="[word-break:break-word] content-stretch flex gap-[10px] items-center px-[26px] py-[20px] relative size-full whitespace-nowrap">
          <p className="font-['Font_Awesome_6_Pro:Regular',sans-serif] leading-[normal] not-italic overflow-hidden relative shrink-0 text-[#247ae4] text-[19px] text-ellipsis">{`\uF0F3`}</p>
          <p className="flex-[1_0_0] font-['DM_Sans:Regular',sans-serif] font-normal h-[19px] leading-[0] min-w-px overflow-hidden relative text-[15px] text-black text-ellipsis" style={{ fontVariationSettings: '"opsz" 14' }}>
            <span className="leading-[normal] text-[#262630]">You have</span>
            <span className="leading-[normal]">{` a upcoming board election. Go to the `}</span>
            <span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold leading-[normal] text-[#247ae4]" style={{ fontVariationSettings: '"opsz" 14' }}>{`Elections `}</span>
            <span className="leading-[normal]">page to submit your vote.</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function Frame44() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full">
      <Frame38 />
    </div>
  );
}

function Frame39() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 text-right whitespace-nowrap">
      <p className="font-['DM_Sans:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[15px]" style={{ fontVariationSettings: '"opsz" 14' }}>
        Account #: 4329980
      </p>
      <p className="font-['Font_Awesome_7_Pro:Solid',sans-serif] leading-[16px] not-italic relative shrink-0 text-[14px]">{`\uF078`}</p>
    </div>
  );
}

function Frame18() {
  return (
    <div className="[word-break:break-word] content-stretch flex gap-[14px] items-center relative shrink-0 text-[#262630] w-full">
      <p className="flex-[1_0_0] font-['DM_Sans:SemiBold',sans-serif] font-semibold leading-[normal] min-w-px relative text-[20px]" style={{ fontVariationSettings: '"opsz" 14' }}>
        Payments
      </p>
      <Frame39 />
    </div>
  );
}

function Frame21() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0 text-[14px]">
      <p className="font-['DM_Sans:Regular',sans-serif] font-normal opacity-62 relative shrink-0" style={{ fontVariationSettings: '"opsz" 14' }}>
        Current Balance
      </p>
      <p className="font-['Font_Awesome_6_Pro:Regular',sans-serif] not-italic relative shrink-0">{`\uF059`}</p>
    </div>
  );
}

function Frame22() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0 text-[14px]">
      <p className="font-['DM_Sans:Regular',sans-serif] font-normal opacity-62 relative shrink-0" style={{ fontVariationSettings: '"opsz" 14' }}>
        Upcoming Charges
      </p>
      <p className="font-['Font_Awesome_6_Pro:Regular',sans-serif] not-italic relative shrink-0">{`\uF059`}</p>
    </div>
  );
}

function Frame20() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[20px] items-start justify-center min-w-px relative">
      <div className="relative shrink-0">
        <div className="[word-break:break-word] content-stretch flex flex-col gap-px items-start leading-[normal] relative size-full text-[#262630] whitespace-nowrap">
          <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold relative shrink-0 text-[34px]" style={{ fontVariationSettings: '"opsz" 14' }}>
            $2,911.14
          </p>
          <Frame21 />
        </div>
      </div>
      <div className="relative shrink-0">
        <div className="[word-break:break-word] content-stretch flex flex-col gap-px items-start leading-[normal] relative size-full text-[#262630] whitespace-nowrap">
          <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold relative shrink-0 text-[24px]" style={{ fontVariationSettings: '"opsz" 14' }}>
            $0.00
          </p>
          <Frame22 />
        </div>
      </div>
    </div>
  );
}

function Frame24() {
  return (
    <div className="bg-[#247ae4] content-stretch flex items-center justify-center px-[24px] py-[10px] relative rounded-[8px] shrink-0">
      <p className="[word-break:break-word] font-['DM_Sans:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[16px] text-center text-white whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>
        Make a Payment
      </p>
    </div>
  );
}

function Frame25() {
  return (
    <div className="bg-white h-[13.304px] relative rounded-[5.913px] shrink-0 w-[16.261px]">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="relative size-full" />
      </div>
    </div>
  );
}

function Frame40() {
  return (
    <div className="content-stretch flex flex-col gap-[10px] items-end relative shrink-0">
      <div className="relative shrink-0" data-name="AutoPay Toggle">
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex gap-[7px] items-center relative size-full">
            <div className="bg-[#b8bec5] relative rounded-[8.13px] shrink-0 w-[34px]">
              <div className="flex flex-col justify-center size-full">
                <div className="content-stretch flex flex-col items-start justify-center p-[2.217px] relative size-full">
                  <Frame25 />
                </div>
              </div>
            </div>
            <p className="[word-break:break-word] font-['DM_Sans:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#262630] text-[14px] text-center whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>
              Enroll in AutoPay
            </p>
          </div>
        </div>
      </div>
      <p className="[word-break:break-word] font-['DM_Sans:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[#247ae4] text-[14px] whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>
        Manage payments
      </p>
    </div>
  );
}

function Frame23() {
  return (
    <div className="relative self-stretch shrink-0">
      <div className="flex flex-col items-end justify-center size-full">
        <div className="content-stretch flex flex-col gap-[22px] items-end justify-center pb-[11px] pt-[14px] relative size-full">
          <Frame24 />
          <Frame40 />
        </div>
      </div>
    </div>
  );
}

function Frame19() {
  return (
    <div className="content-stretch flex gap-[22px] items-start relative shrink-0 w-full">
      <Frame20 />
      <Frame23 />
    </div>
  );
}

function Widget() {
  return (
    <div className="bg-white drop-shadow-[0px_2px_9px_rgba(18,17,48,0.07)] flex-[1_0_0] min-w-px relative rounded-[18px] self-stretch" data-name="Widget">
      <div aria-hidden className="absolute border border-[#d9e7f0] border-solid inset-0 pointer-events-none rounded-[18px]" />
      <div className="content-stretch flex flex-col gap-[14px] items-start pb-[18px] pt-[24px] px-[26px] relative size-full">
        <Frame18 />
        <Frame19 />
      </div>
    </div>
  );
}

function Frame48() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[2px] items-start min-w-px relative">
      <p className="[word-break:break-word] font-['DM_Sans:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#262630] text-[20px] w-[239px]" style={{ fontVariationSettings: '"opsz" 14' }}>
        Recent Transactions
      </p>
    </div>
  );
}

function Frame28() {
  return (
    <div className="[word-break:break-word] content-stretch flex gap-[7px] items-center leading-[normal] relative shrink-0 text-[#0d5bba] text-[14px] whitespace-nowrap">
      <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold relative shrink-0" style={{ fontVariationSettings: '"opsz" 14' }}>
        View All
      </p>
      <p className="font-['Font_Awesome_6_Pro:Regular',sans-serif] not-italic relative shrink-0">arrow-right</p>
    </div>
  );
}

function Frame27() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[6px] shrink-0">
      <Frame28 />
    </div>
  );
}

function Frame26() {
  return (
    <div className="content-stretch flex gap-[14px] items-start relative shrink-0 w-full">
      <Frame48 />
      <Frame27 />
    </div>
  );
}

function Paragraph() {
  return (
    <div className="content-stretch flex h-[16px] items-start opacity-65 relative shrink-0 w-[70px]" data-name="Paragraph">
      <p className="[word-break:break-word] font-['DM_Sans:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[#262630] text-[12px] whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>
        Jan 5, 2026
      </p>
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="content-stretch flex flex-[1_0_0] h-[20px] items-start min-w-px relative" data-name="Paragraph">
      <p className="[word-break:break-word] font-['DM_Sans:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#262630] text-[15px] whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>
        Annual HOA Fee
      </p>
    </div>
  );
}

function Paragraph2() {
  return (
    <div className="content-stretch flex h-[20px] items-center justify-center relative shrink-0 w-[32px]" data-name="Paragraph">
      <p className="[word-break:break-word] font-['DM_Sans:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#262630] text-[13px] w-[28px]" style={{ fontVariationSettings: '"opsz" 14' }}>
        PAID
      </p>
    </div>
  );
}

function Paragraph3() {
  return (
    <div className="content-stretch flex h-[21px] items-start justify-end pl-[7px] relative shrink-0 w-[67px]" data-name="Paragraph">
      <p className="[word-break:break-word] font-['DM_Sans:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#262630] text-[16px] text-right whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>
        $649.34
      </p>
    </div>
  );
}

function TransactionItem() {
  return (
    <div className="content-stretch flex gap-[22px] items-center relative shrink-0 w-full" data-name="TransactionItem">
      <Paragraph />
      <Paragraph1 />
      <Paragraph2 />
      <Paragraph3 />
    </div>
  );
}

function Container() {
  return <div className="bg-[#d9d9d9] h-px relative shrink-0 w-full" data-name="Container" />;
}

function Paragraph4() {
  return (
    <div className="content-stretch flex h-[16px] items-start opacity-65 relative shrink-0 w-[70px]" data-name="Paragraph">
      <p className="[word-break:break-word] font-['DM_Sans:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[#262630] text-[12px] whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>
        Dec 5, 2025
      </p>
    </div>
  );
}

function Paragraph5() {
  return (
    <div className="content-stretch flex flex-[1_0_0] h-[20px] items-start min-w-px relative" data-name="Paragraph">
      <p className="[word-break:break-word] font-['DM_Sans:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#262630] text-[15px] whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>
        Monthly HOA Fee
      </p>
    </div>
  );
}

function Paragraph6() {
  return (
    <div className="content-stretch flex h-[20px] items-center justify-center relative shrink-0 w-[32px]" data-name="Paragraph">
      <p className="[word-break:break-word] font-['DM_Sans:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#262630] text-[13px] w-[28px]" style={{ fontVariationSettings: '"opsz" 14' }}>
        PAID
      </p>
    </div>
  );
}

function Paragraph7() {
  return (
    <div className="content-stretch flex h-[21px] items-start justify-end pl-[7px] relative shrink-0 w-[67px]" data-name="Paragraph">
      <p className="[word-break:break-word] font-['DM_Sans:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#262630] text-[16px] text-right whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>
        $425.00
      </p>
    </div>
  );
}

function TransactionItem1() {
  return (
    <div className="content-stretch flex gap-[22px] items-center relative shrink-0 w-full" data-name="TransactionItem">
      <Paragraph4 />
      <Paragraph5 />
      <Paragraph6 />
      <Paragraph7 />
    </div>
  );
}

function Container1() {
  return <div className="bg-[#d9d9d9] h-px relative shrink-0 w-full" data-name="Container" />;
}

function Paragraph8() {
  return (
    <div className="content-stretch flex h-[16px] items-start opacity-65 relative shrink-0 w-[70px]" data-name="Paragraph">
      <p className="[word-break:break-word] font-['DM_Sans:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[#262630] text-[12px] whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>
        Nov 5, 2025
      </p>
    </div>
  );
}

function Paragraph9() {
  return (
    <div className="content-stretch flex flex-[1_0_0] h-[20px] items-start min-w-px relative" data-name="Paragraph">
      <p className="[word-break:break-word] font-['DM_Sans:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#262630] text-[15px] whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>
        Monthly HOA Fee
      </p>
    </div>
  );
}

function Paragraph10() {
  return (
    <div className="content-stretch flex h-[20px] items-center justify-center relative shrink-0 w-[32px]" data-name="Paragraph">
      <p className="[word-break:break-word] font-['DM_Sans:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#262630] text-[13px] w-[28px]" style={{ fontVariationSettings: '"opsz" 14' }}>
        PAID
      </p>
    </div>
  );
}

function Paragraph11() {
  return (
    <div className="content-stretch flex h-[21px] items-start justify-end pl-[7px] relative shrink-0 w-[67px]" data-name="Paragraph">
      <p className="[word-break:break-word] font-['DM_Sans:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#262630] text-[16px] text-right whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>
        $425.00
      </p>
    </div>
  );
}

function TransactionItem2() {
  return (
    <div className="content-stretch flex gap-[22px] items-center relative shrink-0 w-full" data-name="TransactionItem">
      <Paragraph8 />
      <Paragraph9 />
      <Paragraph10 />
      <Paragraph11 />
    </div>
  );
}

function Frame29() {
  return (
    <div className="content-stretch flex gap-[32px] items-start relative shrink-0 w-full">
      <Widget />
      <div className="bg-white drop-shadow-[0px_2px_9px_rgba(18,17,48,0.07)] flex-[1_0_0] min-w-px relative rounded-[18px]" data-name="Widget">
        <div className="content-stretch flex flex-col gap-[24px] items-start px-[26px] py-[24px] relative size-full">
          <Frame26 />
          <div className="relative shrink-0 w-full" data-name="Transaction List">
            <div className="content-stretch flex flex-col gap-[11px] items-start relative size-full">
              <div className="h-[37px] relative shrink-0 w-full" data-name="Transaction">
                <div className="content-stretch flex flex-col gap-[15px] items-start relative size-full">
                  <TransactionItem />
                  <Container />
                </div>
              </div>
              <div className="h-[37px] relative shrink-0 w-full" data-name="Transaction">
                <div className="content-stretch flex flex-col gap-[15px] items-start relative size-full">
                  <TransactionItem1 />
                  <Container1 />
                </div>
              </div>
              <div className="relative shrink-0 w-full" data-name="Transaction">
                <div className="content-stretch flex flex-col gap-[15px] items-start relative size-full">
                  <TransactionItem2 />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame49() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[2px] items-start min-w-px relative">
      <p className="[word-break:break-word] font-['DM_Sans:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#262630] text-[20px] w-[239px]" style={{ fontVariationSettings: '"opsz" 14' }}>
        Inbox
      </p>
    </div>
  );
}

function Frame32() {
  return (
    <div className="[word-break:break-word] content-stretch flex gap-[7px] items-center leading-[normal] relative shrink-0 text-[#0d5bba] text-[14px] whitespace-nowrap">
      <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold relative shrink-0" style={{ fontVariationSettings: '"opsz" 14' }}>
        View All
      </p>
      <p className="font-['Font_Awesome_6_Pro:Regular',sans-serif] not-italic relative shrink-0">arrow-right</p>
    </div>
  );
}

function Frame31() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[6px] shrink-0">
      <Frame32 />
    </div>
  );
}

function Frame30() {
  return (
    <div className="content-stretch flex gap-[14px] items-center relative shrink-0 w-full">
      <Frame49 />
      <Frame31 />
    </div>
  );
}

function Count1() {
  return (
    <div className="bg-[#f17d11] content-stretch flex flex-col items-center justify-center relative rounded-[50px] shrink-0 size-[19px]" data-name="Count">
      <p className="[word-break:break-word] font-['DM_Sans:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[13px] text-center text-white whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>
        3
      </p>
    </div>
  );
}

function Count2() {
  return (
    <div className="bg-white content-stretch flex flex-col items-center justify-center relative rounded-[50px] shrink-0 size-[19px]" data-name="Count">
      <p className="[word-break:break-word] font-['DM_Sans:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#262630] text-[13px] text-center whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>
        5
      </p>
    </div>
  );
}

function Count3() {
  return (
    <div className="bg-white content-stretch flex flex-col items-center justify-center relative rounded-[50px] shrink-0 size-[19px]" data-name="Count">
      <p className="[word-break:break-word] font-['DM_Sans:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#262630] text-[13px] text-center whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>
        3
      </p>
    </div>
  );
}

function Frame45() {
  return (
    <div className="content-stretch flex gap-[9px] items-center relative shrink-0">
      <FilterChip className="bg-[#247ae4] relative rounded-[50px] shrink-0" />
      <div className="bg-[#fff0dd] relative rounded-[50px] shrink-0" data-name="Filter Chip">
        <div className="content-stretch flex gap-[10px] items-start pl-[15px] pr-[7px] py-[8px] relative size-full">
          <p className="[word-break:break-word] font-['DM_Sans:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#262630] text-[14px] whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>
            Needs Attention
          </p>
          <Count1 />
        </div>
      </div>
      <div className="bg-[#dfeaf0] relative rounded-[50px] shrink-0" data-name="Filter Chip">
        <div className="content-stretch flex gap-[10px] items-start pl-[15px] pr-[7px] py-[8px] relative size-full">
          <p className="[word-break:break-word] font-['DM_Sans:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#262630] text-[14px] whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>
            Announcements
          </p>
          <Count2 />
        </div>
      </div>
      <div className="bg-[#dfeaf0] relative rounded-[50px] shrink-0" data-name="Filter Chip">
        <div className="content-stretch flex gap-[10px] items-start pl-[15px] pr-[7px] py-[8px] relative size-full">
          <p className="[word-break:break-word] font-['DM_Sans:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#262630] text-[14px] whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>
            Messages
          </p>
          <Count3 />
        </div>
      </div>
    </div>
  );
}

function Frame41() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[3px] items-center min-w-px relative">
      <p className="font-['DM_Sans:Regular',sans-serif] font-normal relative shrink-0" style={{ fontVariationSettings: '"opsz" 14' }}>
        --
      </p>
      <p className="flex-[1_0_0] font-['DM_Sans:SemiBold',sans-serif] font-semibold min-w-px opacity-70 overflow-hidden relative text-ellipsis" style={{ fontVariationSettings: '"opsz" 14' }}>{`Join us this Saturday for a splashin' good time at the community pool. The fun begins`}</p>
    </div>
  );
}

function Frame47() {
  return (
    <div className="flex-[1_0_0] min-w-px relative">
      <div className="flex flex-row items-center size-full">
        <div className="[word-break:break-word] content-stretch flex gap-[3px] items-center leading-[normal] pr-[30px] relative size-full text-[14px] text-black whitespace-nowrap">
          <p className="font-['DM_Sans:Bold',sans-serif] font-bold relative shrink-0" style={{ fontVariationSettings: '"opsz" 14' }}>
            Pool Party This Weekend!
          </p>
          <Frame41 />
        </div>
      </div>
    </div>
  );
}

function Frame51() {
  return (
    <div className="h-[24px] relative shrink-0 w-full">
      <div className="absolute bg-[#d9ebfa] h-[24px] left-0 rounded-[50px] top-0" data-name="Status Tag - Simple">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex gap-[8px] items-center justify-center px-[10px] relative size-full">
            <p className="[word-break:break-word] font-['DM_Sans:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#262630] text-[13px] whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>
              Open
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame52() {
  return (
    <div className="content-stretch flex flex-col items-end justify-center relative shrink-0 w-[80px]">
      <Frame51 />
    </div>
  );
}

function Frame53() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[3px] items-center min-w-px relative">
      <p className="relative shrink-0" style={{ fontVariationSettings: '"opsz" 14' }}>
        --
      </p>
      <p className="flex-[1_0_0] min-w-px opacity-70 overflow-hidden relative text-ellipsis" style={{ fontVariationSettings: '"opsz" 14' }}>
        We are reviewing your recent request and will be in touch shortly. Please have all
      </p>
    </div>
  );
}

function Frame50() {
  return (
    <div className="flex-[1_0_0] min-w-px relative">
      <div className="flex flex-row items-center size-full">
        <div className="[word-break:break-word] content-stretch flex font-['DM_Sans:Regular',sans-serif] font-normal gap-[3px] items-center leading-[normal] pr-[30px] relative size-full text-[14px] text-black whitespace-nowrap">
          <p className="opacity-70 relative shrink-0" style={{ fontVariationSettings: '"opsz" 14' }}>
            Request received
          </p>
          <Frame53 />
        </div>
      </div>
    </div>
  );
}

function Frame55() {
  return (
    <div className="h-[24px] relative shrink-0 w-full">
      <div className="absolute bg-[#d9ebfa] h-[24px] left-0 rounded-[50px] top-0" data-name="Status Tag - Simple">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex gap-[8px] items-center justify-center px-[10px] relative size-full">
            <p className="[word-break:break-word] font-['DM_Sans:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#262630] text-[13px] whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>
              Updated
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame54() {
  return (
    <div className="content-stretch flex flex-col items-end justify-center relative shrink-0 w-[80px]">
      <Frame55 />
    </div>
  );
}

function Frame57() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[3px] items-center min-w-px relative">
      <p className="font-['DM_Sans:Regular',sans-serif] font-normal relative shrink-0" style={{ fontVariationSettings: '"opsz" 14' }}>
        --
      </p>
      <p className="flex-[1_0_0] font-['DM_Sans:SemiBold',sans-serif] font-semibold min-w-px opacity-70 overflow-hidden relative text-ellipsis" style={{ fontVariationSettings: '"opsz" 14' }}>
        The landscaping crew will be on site next Tuesday for regular maintenance. Please keep all pets indoors
      </p>
    </div>
  );
}

function Frame56() {
  return (
    <div className="flex-[1_0_0] min-w-px relative">
      <div className="flex flex-row items-center size-full">
        <div className="[word-break:break-word] content-stretch flex gap-[3px] items-center leading-[normal] pr-[30px] relative size-full text-[14px] text-black whitespace-nowrap">
          <p className="font-['DM_Sans:Bold',sans-serif] font-bold relative shrink-0" style={{ fontVariationSettings: '"opsz" 14' }}>
            Landscaping Schedule
          </p>
          <Frame57 />
        </div>
      </div>
    </div>
  );
}

function Frame59() {
  return (
    <div className="h-[24px] relative shrink-0 w-full">
      <div className="absolute h-[24px] left-0 rounded-[50px] top-0" data-name="Status Tag - Simple">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex gap-[8px] items-center justify-center px-[10px] relative size-full">
            <p className="[word-break:break-word] font-['DM_Sans:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#262630] text-[13px] whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>
              Scheduled
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame58() {
  return (
    <div className="content-stretch flex flex-col items-end justify-center relative shrink-0 w-[80px]">
      <Frame59 />
    </div>
  );
}

function Frame61() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[3px] items-center min-w-px relative">
      <p className="font-['DM_Sans:Regular',sans-serif] font-normal relative shrink-0" style={{ fontVariationSettings: '"opsz" 14' }}>
        --
      </p>
      <p className="flex-[1_0_0] font-['DM_Sans:SemiBold',sans-serif] font-semibold min-w-px opacity-70 overflow-hidden relative text-ellipsis" style={{ fontVariationSettings: '"opsz" 14' }}>
        Effective immediately, all packages will be delivered to the front office. Please pick them up within 48 hours
      </p>
    </div>
  );
}

function Frame60() {
  return (
    <div className="flex-[1_0_0] min-w-px relative">
      <div className="flex flex-row items-center size-full">
        <div className="[word-break:break-word] content-stretch flex gap-[3px] items-center leading-[normal] pr-[30px] relative size-full text-[14px] text-black whitespace-nowrap">
          <p className="font-['DM_Sans:Bold',sans-serif] font-bold relative shrink-0" style={{ fontVariationSettings: '"opsz" 14' }}>
            Package Delivery Changes
          </p>
          <Frame61 />
        </div>
      </div>
    </div>
  );
}

function Frame63() {
  return (
    <div className="h-[24px] relative shrink-0 w-full">
      <div className="absolute h-[24px] left-0 rounded-[50px] top-0" data-name="Status Tag - Simple">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex gap-[8px] items-center justify-center px-[10px] relative size-full">
            <p className="[word-break:break-word] font-['DM_Sans:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#262630] text-[13px] whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>
              Updated
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame62() {
  return (
    <div className="content-stretch flex flex-col items-end justify-center relative shrink-0 w-[80px]">
      <Frame63 />
    </div>
  );
}

function Frame65() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[3px] items-center min-w-px relative">
      <p className="relative shrink-0" style={{ fontVariationSettings: '"opsz" 14' }}>
        --
      </p>
      <p className="flex-[1_0_0] min-w-px opacity-70 overflow-hidden relative text-ellipsis" style={{ fontVariationSettings: '"opsz" 14' }}>
        The next board meeting is scheduled for next Wednesday at 7 PM in the clubhouse. All residents are welcome
      </p>
    </div>
  );
}

function Frame64() {
  return (
    <div className="flex-[1_0_0] min-w-px relative">
      <div className="flex flex-row items-center size-full">
        <div className="[word-break:break-word] content-stretch flex font-['DM_Sans:Regular',sans-serif] font-normal gap-[3px] items-center leading-[normal] pr-[30px] relative size-full text-[14px] text-black whitespace-nowrap">
          <p className="opacity-70 relative shrink-0" style={{ fontVariationSettings: '"opsz" 14' }}>
            Board Meeting Next Week
          </p>
          <Frame65 />
        </div>
      </div>
    </div>
  );
}

function Frame67() {
  return (
    <div className="h-[24px] relative shrink-0 w-full">
      <div className="absolute bg-[#d9ebfa] h-[24px] left-0 rounded-[50px] top-0" data-name="Status Tag - Simple">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex gap-[8px] items-center justify-center px-[10px] relative size-full">
            <p className="[word-break:break-word] font-['DM_Sans:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#262630] text-[13px] whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>
              Scheduled
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame66() {
  return (
    <div className="content-stretch flex flex-col items-end justify-center relative shrink-0 w-[80px]">
      <Frame67 />
    </div>
  );
}

function Frame46() {
  return (
    <div className="bg-white content-stretch flex flex-col items-start relative shrink-0 w-full">
      <div aria-hidden className="absolute border-[#d9d9d9] border-solid border-t inset-0 pointer-events-none" />
      <div className="h-[46px] relative shrink-0 w-full" data-name="Message Line Item">
        <div aria-hidden className="absolute border-[#d9d9d9] border-b border-solid inset-0 pointer-events-none" />
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex gap-[29px] items-center px-[22px] py-[14px] relative size-full">
            <div className="relative shrink-0 size-[8px]">
              <svg className="absolute block inset-0 size-full" fill="none" height="8" preserveAspectRatio="none" viewBox="0 0 8 8" width="8">
                <circle cx="4" cy="4" fill="#247AE4" id="Ellipse 2" r="4" />
              </svg>
            </div>
            <p className="[word-break:break-word] font-['DM_Sans:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[14px] text-black w-[120px]" style={{ fontVariationSettings: '"opsz" 14' }}>
              Reminder
            </p>
            <Frame47 />
            <Frame52 />
            <p className="[word-break:break-word] font-['DM_Sans:Bold',sans-serif] font-bold leading-[normal] relative shrink-0 text-[14px] text-black w-[50px]" style={{ fontVariationSettings: '"opsz" 14' }}>
              July 6
            </p>
          </div>
        </div>
      </div>
      <div className="h-[46px] relative shrink-0 w-full" data-name="Message Line Item">
        <div aria-hidden className="absolute border-[#d9d9d9] border-b border-solid inset-0 pointer-events-none" />
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex gap-[29px] items-center px-[22px] py-[14px] relative size-full">
            <div className="relative shrink-0 size-[8px]">
              <svg className="absolute block inset-0 size-full" fill="none" height="32" preserveAspectRatio="none" viewBox="0 0 32 32" width="32">
                <circle cx="4" cy="4" fill="#247AE4" id="Ellipse 2" opacity="0" r="4" />
              </svg>
            </div>
            <p className="[word-break:break-word] font-['DM_Sans:Regular',sans-serif] font-normal leading-[normal] opacity-70 relative shrink-0 text-[14px] text-black w-[120px]" style={{ fontVariationSettings: '"opsz" 14' }}>
              ARC Request
            </p>
            <Frame50 />
            <Frame54 />
            <p className="[word-break:break-word] font-['DM_Sans:Regular',sans-serif] font-normal leading-[normal] opacity-70 relative shrink-0 text-[14px] text-black w-[50px]" style={{ fontVariationSettings: '"opsz" 14' }}>
              July 1
            </p>
          </div>
        </div>
      </div>
      <div className="h-[46px] relative shrink-0 w-full" data-name="Message Line Item">
        <div aria-hidden className="absolute border-[#d9d9d9] border-b border-solid inset-0 pointer-events-none" />
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex gap-[29px] items-center px-[22px] py-[14px] relative size-full">
            <div className="relative shrink-0 size-[8px]">
              <svg className="absolute block inset-0 size-full" fill="none" height="8" preserveAspectRatio="none" viewBox="0 0 8 8" width="8">
                <circle cx="4" cy="4" fill="#247AE4" id="Ellipse 2" r="4" />
              </svg>
            </div>
            <p className="[word-break:break-word] font-['DM_Sans:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[14px] text-black w-[120px]" style={{ fontVariationSettings: '"opsz" 14' }}>
              Alert
            </p>
            <Frame56 />
            <Frame58 />
            <p className="[word-break:break-word] font-['DM_Sans:Bold',sans-serif] font-bold leading-[normal] relative shrink-0 text-[14px] text-black w-[50px]" style={{ fontVariationSettings: '"opsz" 14' }}>
              July 9
            </p>
          </div>
        </div>
      </div>
      <div className="h-[46px] relative shrink-0 w-full" data-name="Message Line Item">
        <div aria-hidden className="absolute border-[#d9d9d9] border-b border-solid inset-0 pointer-events-none" />
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex gap-[29px] items-center px-[22px] py-[14px] relative size-full">
            <div className="relative shrink-0 size-[8px]">
              <svg className="absolute block inset-0 size-full" fill="none" height="8" preserveAspectRatio="none" viewBox="0 0 8 8" width="8">
                <circle cx="4" cy="4" fill="#247AE4" id="Ellipse 2" r="4" />
              </svg>
            </div>
            <p className="[word-break:break-word] font-['DM_Sans:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[14px] text-black w-[120px]" style={{ fontVariationSettings: '"opsz" 14' }}>
              Heads Up
            </p>
            <Frame60 />
            <Frame62 />
            <p className="[word-break:break-word] font-['DM_Sans:Bold',sans-serif] font-bold leading-[normal] relative shrink-0 text-[14px] text-black w-[50px]" style={{ fontVariationSettings: '"opsz" 14' }}>
              July 8
            </p>
          </div>
        </div>
      </div>
      <div className="h-[46px] relative shrink-0 w-full" data-name="Message Line Item">
        <div aria-hidden className="absolute border-[#d9d9d9] border-b border-solid inset-0 pointer-events-none" />
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex gap-[29px] items-center px-[22px] py-[14px] relative size-full">
            <div className="relative shrink-0 size-[8px]">
              <svg className="absolute block inset-0 size-full" fill="none" height="32" preserveAspectRatio="none" viewBox="0 0 32 32" width="32">
                <circle cx="4" cy="4" fill="#247AE4" id="Ellipse 2" opacity="0" r="4" />
              </svg>
            </div>
            <p className="[word-break:break-word] font-['DM_Sans:Regular',sans-serif] font-normal leading-[normal] opacity-70 relative shrink-0 text-[14px] text-black w-[120px]" style={{ fontVariationSettings: '"opsz" 14' }}>
              Reminder
            </p>
            <Frame64 />
            <Frame66 />
            <p className="[word-break:break-word] font-['DM_Sans:Regular',sans-serif] font-normal leading-[normal] opacity-70 relative shrink-0 text-[14px] text-black w-[50px]" style={{ fontVariationSettings: '"opsz" 14' }}>
              July 7
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame11() {
  return (
    <div className="flex flex-[1_0_0] flex-row items-center self-stretch">
      <div className="flex-[1_0_0] h-full min-w-px relative">
        <div className="overflow-clip rounded-[inherit] size-full">
          <div className="content-stretch flex flex-col gap-[32px] items-start pb-[44px] pt-[31px] px-[44px] relative size-full">
            <Frame13 />
            <Frame44 />
            <Frame29 />
            <div className="bg-white drop-shadow-[0px_2px_9px_rgba(18,17,48,0.07)] relative rounded-[18px] shrink-0 w-full" data-name="Widget">
              <div className="content-stretch flex flex-col gap-[24px] items-start px-[26px] py-[24px] relative size-full">
                <Frame30 />
                <div className="relative shrink-0 w-full" data-name="Inbox Feed">
                  <div className="content-stretch flex flex-col gap-[18px] items-start pb-[12px] relative size-full">
                    <Frame45 />
                    <Frame46 />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Elections() {
  return (
    <div className="bg-gradient-to-b content-stretch flex from-[#edf9f2] items-center relative size-full to-[#ddf2ff]" data-name="Elections">
      <Frame2 />
      <Frame11 />
    </div>
  );
}