import { describe, expect, it } from "vitest";
import { shouldKeepSessionActive } from "../src/tracking.js";

describe("shouldKeepSessionActive", () => {
  it("keeps an active session when the browser context is temporarily unavailable", () => {
    expect(shouldKeepSessionActive({ enabled: true }, null, "zhihu.com")).toBe(true);
  });

  it("stops the session when the active page is clearly not monitored", () => {
    expect(shouldKeepSessionActive({ enabled: true }, { matchedSite: null }, "zhihu.com")).toBe(false);
  });

  it("keeps the session on a matched monitored site", () => {
    expect(shouldKeepSessionActive({ enabled: true }, { matchedSite: "zhihu.com" }, null)).toBe(true);
  });

  it("stops the session when disabled", () => {
    expect(shouldKeepSessionActive({ enabled: false }, null, "zhihu.com")).toBe(false);
  });
});