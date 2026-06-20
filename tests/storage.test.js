import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS, loadState, resetUsage, saveState } from "../src/storage.js";

function createFakeStorage(initial = {}) {
  let data = { ...initial };
  return {
    local: {
      async get(keys) {
        if (Array.isArray(keys)) {
          return Object.fromEntries(keys.map((key) => [key, data[key]]));
        }
        return { ...data };
      },
      async set(next) {
        data = { ...data, ...next };
      }
    },
    get data() {
      return data;
    }
  };
}

describe("storage", () => {
  it("loads defaults when storage is empty", async () => {
    const chromeStorage = createFakeStorage();
    const state = await loadState(chromeStorage);

    expect(state.settings).toEqual(DEFAULT_SETTINGS);
    expect(state.usage.dailySeconds).toBe(0);
    expect(state.pendingSettings).toBeNull();
    expect(state.settings.enabled).toBe(false);
  });

  it("saves complete state", async () => {
    const chromeStorage = createFakeStorage();
    const state = await loadState(chromeStorage);
    state.usage.dailySeconds = 30;

    await saveState(chromeStorage, state);

    expect(chromeStorage.data.usage.dailySeconds).toBe(30);
  });

  it("resets usage to a fresh daily state", async () => {
    const chromeStorage = createFakeStorage({
      usage: {
        date: "2026-06-16",
        dailySeconds: 120,
        siteDailySeconds: { "zhihu.com": 120 },
        activeSite: "zhihu.com",
        sessionStartedAt: 1000,
        sessionSeconds: 60,
        notified: { session: true, daily: true }
      }
    });

    await resetUsage(chromeStorage, "2026-06-16");

    expect(chromeStorage.data.usage).toEqual({
      date: "2026-06-16",
      dailySeconds: 0,
      siteDailySeconds: {},
      activeSite: null,
      sessionStartedAt: null,
      sessionSeconds: 0,
      notified: { session: false, siteDaily: false, daily: false, countdowns: {} }
    });
  });
});
