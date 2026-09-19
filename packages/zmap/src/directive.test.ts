import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// Source-aliased consumers (docs, pathfinder, any Next `transpilePackages`
// setup against src/) never see tsup's banner, so the directive must live in
// the source file itself — see src/index.ts line 1.
describe('"use client" directive', () => {
  it("is the first non-empty line of src/index.ts", () => {
    const indexPath = fileURLToPath(new URL("./index.ts", import.meta.url));
    const contents = readFileSync(indexPath, "utf-8");
    const firstNonEmptyLine = contents
      .split("\n")
      .find((line) => line.trim().length > 0);

    expect(firstNonEmptyLine).toBe('"use client";');
  });
});
