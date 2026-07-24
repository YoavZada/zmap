declare module "*.css";

// `import.meta.env` is Vite's dev-time env object. The library itself isn't a
// Vite app (no `vite` dependency for `vite/client`'s ambient types), and in a
// CJS consumer build `import.meta` is empty at runtime (esbuild can't
// transform it) — so `env` is optional and every read goes through `?.`.
interface ImportMetaEnv {
  readonly DEV?: boolean;
}

interface ImportMeta {
  readonly env?: ImportMetaEnv;
}
