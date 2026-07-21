// tsc declaration emit preserves src/index.ts's side-effect CSS import
// (see tsup.config.ts for the CSS story), but a raw `.css` import in the
// published index.d.ts breaks consumers' typecheck: our `declare module
// "*.css"` ambient (src/global.d.ts) is an input file, not an emitted one, so
// consumers have nothing to resolve the import against. The JS bundles keep
// the import; the declarations must not. rollup-plugin-dts dropped it
// implicitly — this step makes the same guarantee explicit, and fails the
// build if the emit shape ever changes.
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dts = path.join(
  path.dirname(path.dirname(fileURLToPath(import.meta.url))),
  "dist",
  "index.d.ts",
);
const cssImport = /^import "maplibre-gl\/dist\/maplibre-gl\.css";\r?\n/m;
const content = readFileSync(dts, "utf8");
if (!cssImport.test(content)) {
  throw new Error(`expected the maplibre CSS side-effect import in ${dts}`);
}
writeFileSync(dts, content.replace(cssImport, ""));
console.log("index.d.ts: stripped maplibre CSS side-effect import");
