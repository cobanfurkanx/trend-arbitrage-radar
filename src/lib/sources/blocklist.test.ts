import { describe, expect, it } from "vitest";
import { isBlockedSignal } from "./blocklist";
import type { RawSignalInput } from "./types";

function signal(over: Partial<RawSignalInput> & { title: string }): RawSignalInput {
  const { title, ...rest } = over;
  return {
    source: "github",
    sourceUrl: "https://github.com/someone/repo",
    title,
    publishedAt: new Date(),
    engagement: 120,
    ...rest,
  } as RawSignalInput;
}

describe("isBlockedSignal", () => {
  it("blocks big-co org repos", () => {
    expect(
      isBlockedSignal(
        signal({ title: "Some tool", sourceUrl: "https://github.com/facebook/react" })
      ).blocked
    ).toBe(true);
    expect(
      isBlockedSignal(
        signal({ title: "Some model", sourceUrl: "https://github.com/openai/whisper" })
      ).blocked
    ).toBe(true);
  });

  it("blocks flagship product launches in titles", () => {
    expect(isBlockedSignal(signal({ title: "OpenAI launches GPT-6 Astra" })).blocked).toBe(true);
    expect(isBlockedSignal(signal({ title: "Salesforce CEO says the SaaSpocalypse is nonsense" })).blocked).toBe(true);
    expect(isBlockedSignal(signal({ title: "Hands-on with Claude 4 for coding" })).blocked).toBe(true);
  });

  it("blocks established mega repos by star count", () => {
    expect(
      isBlockedSignal(signal({ title: "Tiny tool", engagement: 45000 })).blocked
    ).toBe(true);
  });

  it("blocks stale signals", () => {
    const old = new Date(Date.now() - 90 * 24 * 3600 * 1000);
    expect(isBlockedSignal(signal({ title: "Old launch", publishedAt: old })).blocked).toBe(true);
  });

  it("passes indie work, including wrappers around big models", () => {
    expect(
      isBlockedSignal(signal({ title: "AI Toolbox 3.0", description: "Search every AI chat" })).blocked
    ).toBe(false);
    expect(
      isBlockedSignal(signal({ title: "Metaphor: my weekend roguelike", sourceUrl: "https://github.com/jdoe/metaphor" })).blocked
    ).toBe(false);
  });

  it("does not match substrings (metaphor is not meta)", () => {
    expect(
      isBlockedSignal(signal({ title: "Pineapple notes app", description: "tasty tasks" })).blocked
    ).toBe(false);
  });
});
