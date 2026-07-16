import { describe, it, expect } from "vitest";
import { getErrorMessage } from "./error-handler";

describe("getErrorMessage", () => {
  it("returns message for Error instances", () => {
    expect(getErrorMessage(new Error("test"))).toBe("test");
  });

  it("returns fallback for non-Error", () => {
    expect(getErrorMessage(null, "fallback")).toBe("fallback");
    expect(getErrorMessage(undefined, "fallback")).toBe("fallback");
  });

  it("returns string when err is string", () => {
    expect(getErrorMessage("oops", "fallback")).toBe("oops");
  });
});
