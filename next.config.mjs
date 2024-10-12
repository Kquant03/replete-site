import createMDX from '@next/mdx'

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  experimental: {
    mdxRs: true,
  },
  webpack: (config, { isServer }) => {
    config.experiments = { ...config.experiments, asyncWebAssembly: true };
    
    // Add a rule to handle WebAssembly files
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'asset/resource',
    });

    return config;
  },
  async rewrites() {
    return [
      {
        source: '/api/pneuma',
        destination: '/api/pneuma/route',
      },
    ];
  },
  output: 'standalone',
}

export default createMDX(nextConfig)