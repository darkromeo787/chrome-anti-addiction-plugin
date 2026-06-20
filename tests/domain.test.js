import { describe, expect, it } from "vitest";
import { getMatchedSite, isValidDomain, normalizeSiteInput } from "../src/domain.js";

describe("normalizeSiteInput", () => {
  it("normalizes full URLs to bare domains", () => {
    expect(normalizeSiteInput("https://www.zhihu.com/question/123")).toBe("zhihu.com");
  });

  it("normalizes www-prefixed domains", () => {
    expect(normalizeSiteInput("www.zhihu.com")).toBe("zhihu.com");
  });

  it("keeps bare domains", () => {
    expect(normalizeSiteInput("zhihu.com")).toBe("zhihu.com");
  });

  it("rejects empty and malformed inputs", () => {
    expect(normalizeSiteInput("")).toBeNull();
    expect(normalizeSiteInput("not a domain")).toBeNull();
  });
});

describe("getMatchedSite", () => {
  const sites = ["zhihu.com"];

  it("matches exact domains", () => {
    expect(getMatchedSite("https://zhihu.com", sites)).toBe("zhihu.com");
  });

  it("matches subdomains", () => {
    expect(getMatchedSite("https://api.zhihu.com/people", sites)).toBe("zhihu.com");
  });

  it("does not match lookalike domains", () => {
    expect(getMatchedSite("https://notzhihu.com", sites)).toBeNull();
  });
});

describe("isValidDomain", () => {
  it("accepts normal domains and rejects invalid values", () => {
    expect(isValidDomain("zhihu.com")).toBe(true);
    expect(isValidDomain("localhost")).toBe(false);
    expect(isValidDomain("http://zhihu.com")).toBe(false);
  });
});
