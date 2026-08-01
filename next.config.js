/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  /**
   * The 2026-07 platform restructure moved the protocol/SDK pages under
   * /core and promoted Prism from a Doppler sub-view to a top-level product.
   * Every pre-move URL keeps working as a permanent (308) redirect so the
   * links already in the wild - README, Product Hunt, Reddit, X - don't rot.
   */
  async redirects() {
    return [
      { source: "/protocol", destination: "/core/protocol", permanent: true },
      { source: "/concepts", destination: "/core/concepts", permanent: true },
      { source: "/quickstart", destination: "/core/quickstart", permanent: true },
      { source: "/observability", destination: "/prism", permanent: true },

      // The TypeScript SDK was retired in 2026-07; Python is the single
      // reference implementation. Point every /docs/typescript URL at the
      // matching Python section so external links keep landing on real docs.
      { source: "/docs/typescript", destination: "/docs/python", permanent: true },
      // `cosmo doppler` was renamed `cosmo prism`; the old stdout-stream page
      // is now the --tail section.
      { source: "/docs/cli/doppler", destination: "/docs/cli/tail", permanent: true },

      // /parity has no Python counterpart - send it to the reference index.
      { source: "/docs/typescript/parity", destination: "/docs/python", permanent: true },
      { source: "/docs/typescript/:section", destination: "/docs/python/:section", permanent: true },
    ];
  },
};

module.exports = nextConfig;
