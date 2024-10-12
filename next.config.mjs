import createMDX from '@next/mdx'

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  experimental: {
    mdxRs: true,
  },
  webpack: (config, { isServer }) => {
    // This allows importing of WebAssembly files
    config.experiments = { ...config.experiments, asyncWebAssembly: true };
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
}

const withMDX = createMDX({
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
})

export default withMDX(nextConfig)