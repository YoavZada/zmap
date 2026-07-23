/** @type {import('next').NextConfig} */
// No `typescript.ignoreBuildErrors` override: this package pins
// `typescript@5.9.3` (see package.json) instead of the repo-wide native TS7,
// because Next's own dependency preflight (`verifyTypeScriptSetup`) hard-
// requires the legacy `typescript/lib/typescript.js` compiler-API entry
// point, which TS7's package doesn't ship — Next can't even see TS7 as
// "installed". With a real 5.9 install present, Next's built-in checker
// runs cleanly on its own (verified: "Linting and checking validity of
// types" completes with no errors), so no override is needed here. Every
// other workspace's `pnpm typecheck` still runs on native TS7 via its own
// `tsc --noEmit`; this one workspace is the deliberate exception.
const nextConfig = {};

export default nextConfig;
