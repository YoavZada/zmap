import sdk from "@stackblitz/sdk";
import type { BlockDef } from "../blocks";
import templateIndexHtml from "../../../../templates/vite/index.html?raw";
import templatePackageJson from "../../../../templates/vite/package.json?raw";
import templateMain from "../../../../templates/vite/src/main.tsx?raw";
import templateTsconfig from "../../../../templates/vite/tsconfig.json?raw";
import templateViteConfig from "../../../../templates/vite/vite.config.ts?raw";

/**
 * Opens a block as a ready-to-run Vite project on StackBlitz. The project
 * mirrors templates/vite (the degit starter) with the block as App.tsx —
 * one source of truth for both entry points.
 */
export const openBlockInStackBlitz = (block: BlockDef): void => {
  sdk.openProject(
    {
      title: `zmap — ${block.title}`,
      description: block.description,
      template: "node",
      files: {
        "package.json": templatePackageJson,
        "vite.config.ts": templateViteConfig,
        "tsconfig.json": templateTsconfig,
        "index.html": templateIndexHtml,
        "src/main.tsx": templateMain,
        "src/App.tsx": block.source,
      },
    },
    { newWindow: true },
  );
};
