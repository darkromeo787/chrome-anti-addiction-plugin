import { describe, expect, it } from "vitest";
import { getEnforcementAction } from "../src/enforcement.js";

function createState(overrides = {}) {
  return {
    settings: {
      sites: ["zhihu.com"],
      sessionLimitMinutes: 15,
      siteDailyLimitMinutes: 30,
      dailyLimitMinutes: 1,
      mode: "block",
      warningMinutesBefore: 2,
      strictDelayMinutes: 10,
      ...(overrides.settings ?? {})
    },
    usage: {
      date: "2026-06-16",
      dailySeconds: 60,
      siteDailySeconds: {},
      activeSite: null,
      sessionStartedAt: null,
      sessionSeconds: 0,
      notified: { session: false, daily: false },
      ...(overrides.usage ?? {})
    }
  };
}

describe("getEnforcementAction", () => {
  it("does not redirect non-monitored pages after the daily limit is reached", () => {
    expect(getEnforcementAction(createState({ settings: { enabled: true } }), {
      url: "https://example.com",
      matchedSite: null
    })).toEqual({ type: "none" });
  });

  it("redirects monitored pages after the daily limit is reached", () => {
    expect(getEnforcementAction(createState({ settings: { enabled: true } }), {
      url: "https://zhihu.com",
      matchedSite: "zhihu.com"
    })).toEqual({ type: "redirect-blocked" });
  });

  it("redirects monitored pages after that site's daily limit is reached", () => {
    expect(getEnforcementAction(createState({
      settings: { enabled: true, dailyLimitMinutes: 60, siteDailyLimitMinutes: 1 },
      usage: {
        dailySeconds: 60,
        siteDailySeconds: { "zhihu.com": 60 }
      }
    }), {
      url: "https://zhihu.com",
      matchedSite: "zhihu.com"
    })).toEqual({ type: "redirect-blocked" });
  });

  it("does not redirect when a different site's daily limit is reached", () => {
    expect(getEnforcementAction(createState({
      settings: { enabled: true, dailyLimitMinutes: 60, siteDailyLimitMinutes: 1 },
      usage: {
        dailySeconds: 60,
        siteDailySeconds: { "weibo.com": 60 }
      }
    }), {
      url: "https://zhihu.com",
      matchedSite: "zhihu.com"
    })).toEqual({ type: "none" });
  });

  it("closes monitored pages in gentle mode after the session limit is reached", () => {
    expect(getEnforcementAction(createState({
      settings: { enabled: true, mode: "gentle", sessionLimitMinutes: 1 },
      usage: { sessionSeconds: 60 }
    }), {
      url: "https://zhihu.com",
      matchedSite: "zhihu.com"
    })).toEqual({ type: "close-tab" });
  });

  it("redirects monitored pages in block mode after the session limit is reached", () => {
    expect(getEnforcementAction(createState({
      settings: { enabled: true, mode: "block", sessionLimitMinutes: 1, dailyLimitMinutes: 60 },
      usage: { dailySeconds: 30, sessionSeconds: 60 }
    }), {
      url: "https://zhihu.com",
      matchedSite: "zhihu.com"
    })).toEqual({ type: "redirect-blocked" });
  });

  it("redirects monitored pages in strict mode after the session limit is reached", () => {
    expect(getEnforcementAction(createState({
      settings: { enabled: true, mode: "strict", sessionLimitMinutes: 1, dailyLimitMinutes: 60 },
      usage: { dailySeconds: 30, sessionSeconds: 60 }
    }), {
      url: "https://zhihu.com",
      matchedSite: "zhihu.com"
    })).toEqual({ type: "redirect-blocked" });
  });

  it("does not enforce while disabled", () => {
    expect(getEnforcementAction(createState({ settings: { enabled: false } }), {
      url: "https://zhihu.com",
      matchedSite: "zhihu.com"
    })).toEqual({ type: "none" });
  });

  it("never enforces chrome internal pages", () => {
    expect(getEnforcementAction(createState({ settings: { enabled: true } }), {
      url: "chrome://extensions",
      matchedSite: "zhihu.com"
    })).toEqual({ type: "none" });
  });

  it("never enforces extension pages", () => {
    expect(getEnforcementAction(createState({ settings: { enabled: true } }), {
      url: "chrome-extension://abc/pages/blocked.html",
      matchedSite: "zhihu.com"
    })).toEqual({ type: "none" });
  });
});
