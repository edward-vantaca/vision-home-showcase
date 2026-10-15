import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTargetRect } from "../useTargetRect";

describe("useTargetRect", () => {
  it("returns null when name is null", () => {
    const { result } = renderHook(() => useTargetRect(null));
    expect(result.current).toBeNull();
  });

  it("returns null when no element matches", () => {
    const { result } = renderHook(() => useTargetRect("wt-missing"));
    expect(result.current).toBeNull();
  });

  it("returns the element rect when a match exists", () => {
    const el = document.createElement("div");
    el.setAttribute("data-vt-name", "wt-present");
    el.style.viewTransitionName = "wt-present";
    document.body.appendChild(el);
    const { result } = renderHook(() => useTargetRect("wt-present"));
    expect(result.current).not.toBeNull();
    el.remove();
  });

  it("recomputes on window resize", () => {
    const el = document.createElement("div");
    el.setAttribute("data-vt-name", "wt-present");
    el.style.viewTransitionName = "wt-present";
    document.body.appendChild(el);
    const { result } = renderHook(() => useTargetRect("wt-present"));
    const first = result.current;
    act(() => {
      window.dispatchEvent(new Event("resize"));
    });
    expect(result.current).not.toBe(first);
    el.remove();
  });
});
