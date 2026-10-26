/** Centred spinner a "loading" page shows in place of its content. */
export default function PageLoader({ uxId }: { uxId: string }) {
  return (
    <div data-ux-id={uxId} className="flex h-full items-center justify-center">
      <div role="status" aria-label="Loading" className="size-[44px] rounded-full border-[3px] border-[#d9e7f0] border-t-[#247ae4] animate-spin" />
    </div>
  );
}
