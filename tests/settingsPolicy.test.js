import { describe, expect, it } from "vitest";
import { classifySettingsChange, createPendingSettings } from "../src/settingsPolicy.js";

const base = {
  sites: ["zhihu.com", "weibo.com"],
  sessionLimitMinutes: 15,
  dailyLimitMinutes: 45,
  mode: "strict",
  warningMinutesBefore: 2,
  strictDelayMinutes: 10
};

describe("classifySettingsChange", () => {
  it("treats removing a site as relaxing", () => {
    expect(classifySettingsChange(base, { ...base, sites: ["zhihu.com"] })).toBe("relaxing");
  });

  it("treats adding a site as tightening", () => {
    expect(classifySettingsChange(base, { ...base, sites: [...base.sites, "youtube.com"] })).toBe("tightening");
  });

  it("treats increasing limits as relaxing", () => {
    expect(classifySettingsChange(base, { ...base, dailyLimitMinutes: 60 })).toBe("relaxing");
    expect(classifySettingsChange(base, { ...base, sessionLimitMinutes: 30 })).toBe("relaxing");
  });

  it("treats switching to a weaker mode as relaxing", () => {
    expect(classifySettingsChange(base, { ...base, mode: "block" })).toBe("relaxing");
  });

  it("treats unchanged settings as neutral", () => {
    expect(classifySettingsChange(base, { ...base })).toBe("neutral");
  });
});

describe("createPendingSettings", () => {
  it("stores settings with an activation timestamp", () => {
    expect(createPendingSettings({ ...base, mode: "block" }, 1000, 10)).toEqual({
      settings: { ...base, mode: "block" },
      effectiveAt: 601000
    });
  });
});
