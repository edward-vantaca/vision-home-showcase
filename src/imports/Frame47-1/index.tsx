import imgImage2 from "./368b64ba7a10f1dc6a2c16909e6f78f7033059bb.png";

function Paragraph() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Paragraph">
      <p className="[word-break:break-word] font-['DM_Sans:SemiBold',sans-serif] font-semibold leading-[22.5px] relative shrink-0 text-[#262630] text-[15px] whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>
        Action Needed – Submit your ballot
      </p>
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="content-stretch flex flex-col items-start opacity-80 relative shrink-0 w-full" data-name="Paragraph">
      <p className="[word-break:break-word] font-['DM_Sans:Regular',sans-serif] font-normal leading-[22.5px] relative shrink-0 text-[#262630] text-[15px] whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>
        Voting closes on September 15, 2026 at 5:00PM
      </p>
    </div>
  );
}

function ParagraphMargin() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[2px] relative shrink-0 w-full" data-name="Paragraph:margin">
      <Paragraph1 />
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-w-px relative">
      <Paragraph />
      <ParagraphMargin />
    </div>
  );
}

function Frame() {
  return (
    <div className="bg-[#247ae4] content-stretch flex items-center justify-center px-[24px] py-[10px] relative rounded-[8px] shrink-0">
      <p className="[word-break:break-word] font-['DM_Sans:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[16px] text-center text-white whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>
        Vote Now
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
    <div className="content-stretch flex items-center relative shrink-0 w-[543px]" data-name="Container">
      <Frame1 />
      <Frame2 />
    </div>
  );
}

function Container() {
  return (
    <div className="bg-white border border-[#d9e7f0] border-solid content-stretch flex h-[113px] items-center px-[24px] py-[18px] relative rounded-[18px] shrink-0" data-name="Container">
      <Container1 />
    </div>
  );
}

function Paragraph2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Paragraph">
      <p className="[word-break:break-word] font-['DM_Sans:SemiBold',sans-serif] font-semibold leading-[22.5px] relative shrink-0 text-[#262630] text-[15px] whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>
        Election Progress
      </p>
    </div>
  );
}

function Frame4() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-w-px relative">
      <Paragraph2 />
      <div className="aspect-[1972/212] relative shrink-0 w-full" data-name="image 2">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage2} />
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-[484px]" data-name="Container">
      <Frame4 />
    </div>
  );
}

function Container2() {
  return (
    <div className="bg-white border border-[#d9e7f0] border-solid content-stretch flex items-center px-[24px] py-[18px] relative rounded-[18px] shrink-0 w-[549px]" data-name="Container">
      <Container3 />
    </div>
  );
}

export default function Frame3() {
  return (
    <div className="content-stretch flex gap-[16px] items-start relative size-full">
      <Container />
      <Container2 />
    </div>
  );
}