import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { fireEvent } from "@testing-library/dom";
import { useWalkthroughKeyboard } from "../keyboard";
import { WalkthroughProvider, useCursor } from "../cursor";
import type { Sequence } from "../types";

const seq: Sequence = [
  { id: "a", page: "dashboard", beats: [{ kind: "idle" }, { kind: "idle" }, { kind: "idle" }] },
];

function wrapper({ children }: { children: React.ReactNode }) {
  return <WalkthroughProvider sequence={seq}>{children}</WalkthroughProvider>;
}

function useAll() {
  useWalkthroughKeyboard();
  return useCursor();
}

describe("useWalkthroughKeyboard", () => {
  it("advances on ArrowRight", () => {
    const { result } = renderHook(() => useAll(), { wrapper });
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(result.current.cursor).toEqual({ sceneIndex: 0, beatIndex: 1 });
  });

  it("goes back on ArrowLeft", () => {
    const { result } = renderHook(() => useAll(), { wrapper });
    fireEvent.keyDown(window, { key: "ArrowRight" });
    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(result.current.cursor).toEqual({ sceneIndex: 0, beatIndex: 0 });
  });

  it("Esc returns to (0,0)", () => {
    const { result } = renderHook(() => useAll(), { wrapper });
    fireEvent.keyDown(window, { key: "ArrowRight" });
    fireEvent.keyDown(window, { key: "ArrowRight" });
    fireEvent.keyDown(window, { key: "Escape" });
    expect(result.current.cursor).toEqual({ sceneIndex: 0, beatIndex: 0 });
  });

  it("toggles HUD on '.'", () => {
    const { result } = renderHook(() => useAll(), { wrapper });
    expect(result.current.hudVisible).toBe(false);
    fireEvent.keyDown(window, { key: "." });
    expect(result.current.hudVisible).toBe(true);
  });

  it("ignores keydown when target is an input", () => {
    const { result } = renderHook(() => useAll(), { wrapper });
    const input = document.createElement("input");
    document.body.appendChild(input);
    input.focus();
    fireEvent.keyDown(input, { key: "ArrowRight" });
    expect(result.current.cursor).toEqual({ sceneIndex: 0, beatIndex: 0 });
    input.remove();
  });
});
