/**
 * Prepares a demo file's raw source (imported via Vite's `?raw`) for display.
 *
 * Demo files are self-contained and shown verbatim, so the code people read is
 * exactly the code that runs. When a file needs docs-only setup that would
 * only add noise (page-style imports, harness wiring), put it above a
 * `// ---cut---` line — everything up to and including the marker is dropped
 * from the displayed source.
 */
export function stripDemoSource(raw: string): string {
  const marker = /^[ \t]*\/\/ ---cut---[ \t]*\r?\n/m;
  const match = raw.match(marker);
  const shown = match ? raw.slice((match.index ?? 0) + match[0].length) : raw;
  return shown.trimEnd();
}
