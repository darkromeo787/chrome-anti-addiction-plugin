import { describe, expect, it } from "vitest";
import {
  createDefaultUsage,
  getTodayKey,
  normalizeUsage,
  resetUsageForDate,
  shouldSendWarning,
  startSession,
  tickUsage
} from "../src/usage.js";

describe("usage state", () => {
  it("creates default usage for a date", () => {
    expect(createDefaultUsage("2026-06-16")).toEqual({
      date: "2026-06-16",
      dailySeconds: 0,
      siteDailySeconds: {},
      activeSite: null,
      sessionStartedAt: null,
      sessionSeconds: 0,
      notified: {
        session: false,
        siteDaily: false,
        daily: false,
        countdowns: {}
      }
    });
  });

  it("formats local dates as yyyy-mm-dd", () => {
    expect(getTodayKey(new Date("2026-06-16T03:04:05"))).toBe("2026-06-16");
  });

  it("resets usage when the date changes", () => {
    const usage = createDefaultUsage("2026-06-15");
    usage.dailySeconds = 120;
    expect(resetUsageForDate(usage, "2026-06-16").dailySeconds).toBe(0);
  });

  it("adds elapsed seconds when active", () => {
    const usage = {
      ...createDefaultUsage("2026-06-16"),
      activeSite: "zhihu.com",
      sessionStartedAt: 1000
    };

    const next = tickUsage(usage, 6000);
    expect(next.dailySeconds).toBe(5);
    expect(next.siteDailySeconds["zhihu.com"]).toBe(5);
    expect(next.sessionSeconds).toBe(5);
    expect(next.sessionStartedAt).toBe(6000);
  });

  it("keeps per-site daily totals separate from the all-sites total", () => {
    const usage = {
      ...createDefaultUsage("2026-06-16"),
      dailySeconds: 10,
      siteDailySeconds: { "weibo.com": 10 },
      activeSite: "zhihu.com",
      sessionStartedAt: 1000
    };

    const next = tickUsage(usage, 6000);
    expect(next.dailySeconds).toBe(15);
    expect(next.siteDailySeconds).toEqual({
      "weibo.com": 10,
      "zhihu.com": 5
    });
  });

  it("does not add elapsed seconds without an active site", () => {
    const usage = createDefaultUsage("2026-06-16");
    const next = tickUsage(usage, 6000);
    expect(next.dailySeconds).toBe(0);
  });

  it("normalizes countdown notification state for older usage records", () => {
    const next = normalizeUsage({
      date: "2026-06-16",
      notified: { session: true }
    });

    expect(next.notified).toEqual({
      session: true,
      siteDaily: false,
      daily: false,
      countdowns: {}
    });
  });
  it("does not restart the session when the same site remains active", () => {
    const usage = {
      ...createDefaultUsage("2026-06-16"),
      activeSite: "zhihu.com",
      sessionStartedAt: 1000,
      sessionSeconds: 30
    };

    const next = startSession(usage, "zhihu.com", 9000);

    expect(next.sessionStartedAt).toBe(1000);
    expect(next.sessionSeconds).toBe(30);
  });
});

describe("warning decisions", () => {
  it("warns once when session time is close to limit", () => {
    const usage = {
      ...createDefaultUsage("2026-06-16"),
      sessionSeconds: 14 * 60,
      dailySeconds: 20 * 60,
      siteDailySeconds: { "zhihu.com": 10 * 60 },
      activeSite: "zhihu.com"
    };

    expect(shouldSendWarning(usage, {
      sessionLimitMinutes: 15,
      siteDailyLimitMinutes: 30,
      dailyLimitMinutes: 45,
      warningMinutesBefore: 2
    })).toEqual({ session: true, siteDaily: false, daily: false });
  });

  it("does not warn again after notification state is set", () => {
    const usage = {
      ...createDefaultUsage("2026-06-16"),
      sessionSeconds: 14 * 60,
      activeSite: "zhihu.com",
      notified: { session: true, siteDaily: false, daily: false }
    };

    expect(shouldSendWarning(usage, {
      sessionLimitMinutes: 15,
      siteDailyLimitMinutes: 30,
      dailyLimitMinutes: 45,
      warningMinutesBefore: 2
    })).toEqual({ session: false, siteDaily: false, daily: false });
  });

  it("warns when the current site daily total is close to its limit", () => {
    const usage = {
      ...createDefaultUsage("2026-06-16"),
      activeSite: "zhihu.com",
      siteDailySeconds: { "zhihu.com": 29 * 60 },
      dailySeconds: 29 * 60
    };

    expect(shouldSendWarning(usage, {
      sessionLimitMinutes: 15,
      siteDailyLimitMinutes: 30,
      dailyLimitMinutes: 60,
      warningMinutesBefore: 2
    })).toEqual({ session: false, siteDaily: true, daily: false });
  });
});
