// Compatibility shim: mockMaplibre lives at ../testing/mockMaplibre now (it's
// published as the `zmapgl/testing` subpath — see src/testing/index.ts).
// Existing tests importing from here keep working untouched.
export * from "../testing/mockMaplibre";
export { default } from "../testing/mockMaplibre";
