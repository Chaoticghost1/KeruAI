import { describe, it, expect, afterEach } from "vitest";
import { resolveOpenAIModel } from "./lib/model-config";

describe("resolveOpenAIModel", () => {
  afterEach(() => {
    delete process.env.OPENAI_MODEL;
  });

  it("returns the env-override when OPENAI_MODEL is set", () => {
    process.env.OPENAI_MODEL = "gpt-4-turbo";
    expect(resolveOpenAIModel()).toBe("gpt-4-turbo");
  });

  it("falls back to a safe GA default (gpt-4o) when unset", () => {
    delete process.env.OPENAI_MODEL;
    const model = resolveOpenAIModel();
    expect(model).toBe("gpt-4o");
    // Must never be the non-existent "gpt-5" placeholder
    expect(model).not.toBe("gpt-5");
  });

  it("trims surrounding whitespace from the env value", () => {
    process.env.OPENAI_MODEL = "  gpt-4o-mini  ";
    expect(resolveOpenAIModel()).toBe("gpt-4o-mini");
  });
});
