# Changesets

Full docs: https://github.com/changesets/changesets

## Release flow for this repo

1. Any PR that changes `packages/zmap` in a user-visible way adds a changeset
   (`pnpm changeset` — pick the bump, write the entry). Docs/infra-only PRs
   skip this.
2. On merge to main, `.github/workflows/release.yml` opens or updates a
   **"chore: version packages"** PR (version bump + changelog). That PR is
   created with the workflow's `GITHUB_TOKEN`, so `ci.yml` does not run on
   it — accepted: it only contains version/changelog edits, and the release
   job re-runs typecheck + tests + build before publishing.
3. Merging the version PR publishes `zmapgl` to npm with provenance, tags
   `zmapgl@x.y.z`, and creates the GitHub Release.

Manual fallback (needs npm access): `pnpm release`.
