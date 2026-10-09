import { afterEach, describe, expect, it } from "vitest";
import { clearRegistry, registerTarget, resolveTarget, unregisterTarget } from "../targetRegistry";

afterEach(() => {
  clearRegistry();
  document.body.innerHTML = "";
});

describe("targetRegistry", () => {
  it("resolves a registered element", () => {
    const el = document.createElement("div");
    registerTarget("foo", el);
    expect(resolveTarget("foo")).toBe(el);
  });

  it("returns null for an unknown id", () => {
    expect(resolveTarget("nope")).toBeNull();
  });

  it("falls back to data-ux-id lookup when id not registered", () => {
    const el = document.createElement("div");
    el.setAttribute("data-ux-id", "fallback-target");
    document.body.appendChild(el);
    expect(resolveTarget("fallback-target")).toBe(el);
  });

  it("prefers registered element over data-ux-id fallback", () => {
    const registered = document.createElement("span");
    const inDom = document.createElement("div");
    inDom.setAttribute("data-ux-id", "both-exist");
    document.body.appendChild(inDom);
    registerTarget("both-exist", registered);
    expect(resolveTarget("both-exist")).toBe(registered);
  });

  it("unregister removes the entry", () => {
    const el = document.createElement("div");
    registerTarget("gone", el);
    unregisterTarget("gone");
    expect(resolveTarget("gone")).toBeNull();
  });
});
