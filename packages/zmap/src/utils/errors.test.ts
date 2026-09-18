import { describe, expect, it } from "vitest";
import { toError } from "./errors";

describe("toError", () => {
  it("passes an Error instance through unchanged", () => {
    const err = new Error("boom");
    expect(toError(err)).toBe(err);
  });

  it("wraps a non-Error value in a real Error", () => {
    const wrapped = toError("boom");
    expect(wrapped).toBeInstanceOf(Error);
    expect(wrapped.message).toBe("boom");
  });
});
