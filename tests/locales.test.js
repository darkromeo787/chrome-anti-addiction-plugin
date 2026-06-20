import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const localeRoot = path.resolve("_locales");
const locales = ["en", "zh_CN", "zh_TW", "fr"];

function loadMessages(locale) {
  return JSON.parse(fs.readFileSync(path.join(localeRoot, locale, "messages.json"), "utf8"));
}

describe("locale messages", () => {
  it("keeps message keys aligned across supported locales", () => {
    const [baseLocale, ...otherLocales] = locales;
    const baseKeys = Object.keys(loadMessages(baseLocale)).sort();

    for (const locale of otherLocales) {
      expect(Object.keys(loadMessages(locale)).sort()).toEqual(baseKeys);
    }
  });

  it("defines extension name and description for the manifest", () => {
    for (const locale of locales) {
      const messages = loadMessages(locale);
      expect(messages.extensionName.message).toBeTruthy();
      expect(messages.extensionDescription.message).toBeTruthy();
    }
  });
});