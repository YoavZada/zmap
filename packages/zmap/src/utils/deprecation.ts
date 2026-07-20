const warned = new Set<string>();

/**
 * One-time, dev-only console.warn for a deprecated prop. The NODE_ENV check
 * is a static literal so consumer bundlers dead-code-eliminate the call in
 * production builds.
 */
export function warnDeprecatedProp(
  component: string,
  oldProp: string,
  newProp: string,
): void {
  if (typeof process !== "undefined" && process.env.NODE_ENV === "production") {
    return;
  }
  const key = `${component}.${oldProp}`;
  if (warned.has(key)) return;
  warned.add(key);
  console.warn(
    `[zmapgl] <${component}>: \`${oldProp}\` is deprecated; use \`${newProp}\`. ` +
      "It will be removed in v1.0.",
  );
}

/** Test-only: forget which deprecations have already warned. */
export function resetDeprecationWarnings(): void {
  warned.clear();
}
