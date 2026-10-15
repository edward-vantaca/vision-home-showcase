function Paragraph() {
  return (
    <div className="content-stretch flex flex-col h-[26px] items-start relative shrink-0 w-full" data-name="Paragraph">
      <p className="[word-break:break-word] font-['DM_Sans:SemiBold',sans-serif] font-semibold leading-[22.5px] relative shrink-0 text-[#262630] text-[16px] whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>
        Want to run in the upcoming elections?
      </p>
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="content-stretch flex flex-col h-[28px] items-start relative shrink-0 w-full" data-name="Paragraph">
      <p className="[word-break:break-word] font-['DM_Sans:Regular',sans-serif] font-normal leading-[22.5px] relative shrink-0 text-[#4b5563] text-[16px] whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>
        Unit 120A - Waterfront
      </p>
    </div>
  );
}

function Frame4() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
      <Paragraph />
      <Paragraph1 />
    </div>
  );
}

function Paragraph2() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-col font-['DM_Sans:Regular',sans-serif] font-normal items-start relative shrink-0 text-[#262630] text-[15px] w-full whitespace-nowrap" data-name="Paragraph">
      <p className="leading-[22.5px] relative shrink-0" style={{ fontVariationSettings: '"opsz" 14' }}>
        Lakestone HOA - Consent Campaign 2026
      </p>
      <p className="leading-[0] relative shrink-0" style={{ fontVariationSettings: '"opsz" 14' }}>
        <span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold leading-[22.5px]" style={{ fontVariationSettings: '"opsz" 14' }}>
          End Date:
        </span>
        <span className="leading-[22.5px]">{` December 18, 2026 7:00PM ET`}</span>
      </p>
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[10px] items-start min-w-px relative">
      <Frame4 />
      <Paragraph2 />
    </div>
  );
}

function Frame() {
  return (
    <div className="bg-[#247ae4] content-stretch flex items-center justify-center px-[24px] py-[10px] relative rounded-[8px] shrink-0">
      <p className="[word-break:break-word] font-['DM_Sans:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[16px] text-center text-white whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>
        Send Link
      </p>
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex items-start relative shrink-0">
      <Frame />
    </div>
  );
}

function Container1() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-center min-w-px relative" data-name="Container">
      <Frame1 />
      <Frame2 />
    </div>
  );
}

function Container() {
  return (
    <div className="bg-white border border-[#d9e7f0] border-solid content-stretch flex flex-[1_0_0] items-center min-w-px px-[24px] py-[18px] relative rounded-[18px]" data-name="Container">
      <Container1 />
    </div>
  );
}

export default function Frame3() {
  return (
    <div className="content-stretch flex items-start relative size-full">
      <Container />
    </div>
  );
}