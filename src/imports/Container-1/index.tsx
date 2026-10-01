function Text() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Text">
      <p className="[word-break:break-word] font-['DM_Sans:SemiBold',sans-serif] font-semibold leading-[19.5px] relative shrink-0 text-[#166534] text-[13px] whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>
        Open
      </p>
    </div>
  );
}

export default function Container() {
  return (
    <div className="bg-[#dcfce7] flex items-center px-[12px] py-[5px] rounded-[50px] w-fit shrink-0" data-name="Container">
      <Text />
    </div>
  );
}