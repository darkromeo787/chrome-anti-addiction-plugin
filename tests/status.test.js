import { describe, expect, it } from "vitest";
import { getCountdownCandidates, getCountdownMilestone, getLimitStatus } from "../src/status.js";

const state = {
  settings: {
    enabled: true,
    sessionLimitMinutes: 15,
    siteDailyLimitMinutes: 30,
    dailyLimitMinutes: 60,
    mode: "block"
  },
  usage: {
    dailySeconds: 20 * 60,
    siteDailySeconds: { "zhihu.com": 10 * 60 },
    activeSite: "zhihu.com",
    sessionSeconds: 5 * 60
  }
};

describe("getLimitStatus", () => {
  it("returns session, current-site, and all-sites status", () => {
    expect(getLimitStatus(state, { matchedSite: "zhihu.com" })).toEqual({
      enabled: true,
      matchedSite: "zhihu.com",
      mode: "block",
      session: { usedSeconds: 300, limitSeconds: 900, remainingSeconds: 600 },
      siteDaily: { usedSeconds: 600, limitSeconds: 1800, remainingSeconds: 1200 },
      daily: { usedSeconds: 1200, limitSeconds: 3600, remainingSeconds: 2400 }
    });
  });

  it("returns zero current-site usage when there is no matched site", () => {
    expect(getLimitStatus(state, { matchedSite: null }).siteDaily).toEqual({
      usedSeconds: 0,
      limitSeconds: 1800,
      remainingSeconds: 1800
    });
  });
  it("falls back to the active session site when the active tab is temporarily unavailable", () => {
    expect(getLimitStatus(state, null)).toEqual({
      enabled: true,
      matchedSite: "zhihu.com",
      mode: "block",
      session: { usedSeconds: 300, limitSeconds: 900, remainingSeconds: 600 },
      siteDaily: { usedSeconds: 600, limitSeconds: 1800, remainingSeconds: 1200 },
      daily: { usedSeconds: 1200, limitSeconds: 3600, remainingSeconds: 2400 }
    });
  });

});

describe("getCountdownMilestone", () => {
  it("only returns selected countdown milestones", () => {
    expect(getCountdownMilestone(30)).toBe(30);
    expect(getCountdownMilestone(20)).toBe(20);
    expect(getCountdownMilestone(10)).toBe(10);
    expect(getCountdownMilestone(9)).toBe(9);
    expect(getCountdownMilestone(1)).toBe(1);
    expect(getCountdownMilestone(29)).toBeNull();
    expect(getCountdownMilestone(0)).toBeNull();
  });
});
describe("getCountdownCandidates", () => {
  it("emits the next unnotified milestone after a tick crosses below it", () => {
    expect(getCountdownCandidates({
      session: { usedSeconds: 281, limitSeconds: 300, remainingSeconds: 19 },
      siteDaily: { usedSeconds: 0, limitSeconds: 3600, remainingSeconds: 3600 },
      daily: { usedSeconds: 0, limitSeconds: 7200, remainingSeconds: 7200 }
    }, {})).toEqual([
      expect.objectContaining({ type: "session", milestone: 20 })
    ]);
  });

  it("does not repeat milestones that were already notified", () => {
    expect(getCountdownCandidates({
      session: { usedSeconds: 281, limitSeconds: 300, remainingSeconds: 19 },
      siteDaily: { usedSeconds: 0, limitSeconds: 3600, remainingSeconds: 3600 },
      daily: { usedSeconds: 0, limitSeconds: 7200, remainingSeconds: 7200 }
    }, { "session:20": true })).toEqual([]);
  });
});
