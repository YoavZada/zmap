// Re-exports react-docgen-typescript together with the TypeScript 5.9
// instance it resolved (this package's direct dependency), so consumers use
// one coherent legacy compiler — never the workspace's TypeScript 7, whose
// native binary has no JS checker API.
export { withCustomConfig } from "react-docgen-typescript";
export { default as ts } from "typescript";
