import { describe, expect, it } from "vitest";
import { rememberPageUrl } from "../src/popupStatus.js";

describe("rememberPageUrl", () => {
  it("keeps the current http page url", () => {
    expect(rememberPageUrl("https://www.zhihu.com/question/1", null)).toBe("https://www.zhihu.com/question/1");
  });

  it("keeps the previous page url when a later refresh sees the extension popup url", () => {
    expect(rememberPageUrl("chrome-extension://abc/pages/popup.html", "https://www.zhihu.com/question/1")).toBe("https://www.zhihu.com/question/1");
  });

  it("returns null when there is no remembered page url", () => {
    expect(rememberPageUrl("chrome://extensions", null)).toBeNull();
  });
});