/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Checked by `pnpm typecheck` (tsc v7) — Next's bundled checker needs
    // the legacy TS API, which typescript@7 no longer ships.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
