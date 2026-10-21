import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import AskHoaiPanel from "../AskHoaiPanel";

function panel(props: { open: boolean; focused?: boolean }) {
  const { container } = render(<AskHoaiPanel onCollapse={() => {}} {...props} />);
  return container.querySelector('[data-ux-id="askhoai-panel"]') as HTMLElement;
}

describe("AskHoaiPanel morph forms", () => {
  it("animates all properties with the 700ms lift easing", () => {
    expect(panel({ open: true }).style.transition).toContain("700ms");
  });

  it.each([
    ["sidebar", { open: true }, "left-[calc(100%_-_400px)]"],
    ["collapsed", { open: false }, "left-full"],
    ["focused", { open: true, focused: true }, "left-1/2"],
  ])("%s form is fixed with an explicit left and no right", (_name, props, left) => {
    const classes = panel(props).className.split(/\s+/);
    expect(classes).toContain("fixed");
    expect(classes).toContain(left);
    expect(classes.some((c) => c.startsWith("right-"))).toBe(false);
  });
});
