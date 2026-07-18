// Generates src/generated/props.json — the data behind <PropsTable> and the
// /api reference page. Two harvests from the library source:
//
//   1. react-docgen-typescript over every public component: prop name, type,
//      default, required, and the JSDoc description already written on each
//      prop. Inherited MUI/DOM props (from node_modules) are filtered out so
//      tables show the zmap-specific surface.
//   2. The TypeScript checker over src/index.ts: every export the package
//      ships (components, hooks, providers, utils, types) with its JSDoc
//      summary — the /api page's index, generated so it can't drift.
//
// Run `pnpm gen:props` after changing library props/JSDoc; the JSON is
// committed so dev servers and CI don't re-parse on every start.
import { writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { withCustomConfig } from "react-docgen-typescript";

const require = createRequire(import.meta.url);
const ts = require("typescript");

const docsDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const repoRoot = path.dirname(path.dirname(docsDir));
const zmapSrc = path.join(repoRoot, "packages", "zmap", "src");
const outFile = path.join(docsDir, "src", "generated", "props.json");

// --- 1. Component props via react-docgen-typescript ---

const componentsDir = path.join(zmapSrc, "components");
const PRIVATE_COMPONENTS = new Set(["DrawLayers"]);
const componentFiles = readdirSync(componentsDir)
  .filter((name) => !PRIVATE_COMPONENTS.has(name))
  .map((name) => path.join(componentsDir, name, `${name}.tsx`));

const parser = withCustomConfig(
  path.join(repoRoot, "packages", "zmap", "tsconfig.json"),
  {
    shouldExtractLiteralValuesFromEnum: true,
    shouldRemoveUndefinedFromOptional: true,
    savePropValueAsString: true,
    // Surface @deprecated (and other tags) so PropsTable can badge them.
    shouldIncludePropTagMap: true,
    propFilter: (prop) => {
      // Drop props inherited from MUI/React declaration files — the tables
      // document zmap's own surface (Map's table notes the BoxProps passthrough).
      // MUI system props (m, bgcolor, alignContent…) carry no `parent`, so
      // check the declaration files too.
      if (prop.declarations && prop.declarations.length > 0) {
        return prop.declarations.some(
          (d) => !d.fileName.includes("node_modules"),
        );
      }
      if (prop.parent) return !prop.parent.fileName.includes("node_modules");
      // No source info at all: MUI system props (m, bgcolor…) surface this
      // way through BoxProps. Library-declared props always carry a parent.
      return false;
    },
  },
);

const components = {};
for (const doc of parser.parse(componentFiles)) {
  const props = Object.values(doc.props)
    .map((p) => ({
      name: p.name,
      type: p.type.name,
      required: p.required,
      defaultValue: p.defaultValue?.value ?? null,
      description: p.description,
      // "@deprecated Use `x`. Removed in v1.0." → the tag text (or "" if bare).
      deprecated: p.tags?.deprecated ?? null,
    }))
    .sort((a, b) => {
      // Required first, deprecated last, alphabetical within each band.
      if (a.required !== b.required) return a.required ? -1 : 1;
      const aDep = a.deprecated != null;
      const bDep = b.deprecated != null;
      if (aDep !== bDep) return aDep ? 1 : -1;
      return a.name.localeCompare(b.name);
    });
  components[doc.displayName] = {
    description: doc.description,
    props,
  };
}

// --- 2. Every public export via the TypeScript checker ---

function categorize(fileName) {
  if (fileName.includes("/components/")) return "component";
  if (fileName.includes("/hooks/") || fileName.includes("/context/"))
    return "hook";
  if (fileName.includes("/providers/")) return "provider";
  if (fileName.includes("/utils/")) return "util";
  if (fileName.includes("maplibre-gl")) return "reexport";
  return "other";
}

const indexFile = path.join(zmapSrc, "index.ts");
const program = ts.createProgram([indexFile], {
  jsx: ts.JsxEmit.ReactJSX,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  module: ts.ModuleKind.ESNext,
  target: ts.ScriptTarget.ES2021,
  strict: true,
});
const checker = program.getTypeChecker();
const sourceFile = program.getSourceFile(indexFile);
const moduleSymbol = checker.getSymbolAtLocation(sourceFile);

const exports = [];
for (const symbol of checker.getExportsOfModule(moduleSymbol)) {
  const resolved =
    symbol.flags & ts.SymbolFlags.Alias
      ? checker.getAliasedSymbol(symbol)
      : symbol;
  const decl = resolved.declarations?.[0];
  const fileName = decl?.getSourceFile().fileName.replace(/\\/g, "/") ?? "";
  const isType =
    !!decl &&
    (ts.isTypeAliasDeclaration(decl) || ts.isInterfaceDeclaration(decl));
  const docText = ts.displayPartsToString(
    resolved.getDocumentationComment(checker),
  );
  // First JSDoc paragraph, unwrapped — a full sentence, not a clipped line.
  const summary = docText.split(/\n\s*\n/)[0].replace(/\s+/g, " ").trim();
  exports.push({
    name: symbol.getName(),
    kind: isType ? "type" : "value",
    category:
      symbol.getName() === "maplibregl" ? "reexport" : categorize(fileName),
    description: summary,
  });
}
exports.sort((a, b) => a.name.localeCompare(b.name));

// --- write ---

mkdirSync(path.dirname(outFile), { recursive: true });
writeFileSync(outFile, JSON.stringify({ components, exports }, null, 2) + "\n");
console.log(
  `props.json: ${Object.keys(components).length} components, ${exports.length} exports`,
);
