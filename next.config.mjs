import createMDX from '@next/mdx'
import path from 'path'
import CopyPlugin from 'copy-webpack-plugin'

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  experimental: {
    mdxRs: true,
  },
  webpack: (config, { isServer }) => {
    // This allows importing of WebAssembly files
    config.experiments = { ...config.experiments, asyncWebAssembly: true };
    
    // Copy the WebAssembly file to the output directory
    config.plugins.push(
      new CopyPlugin({
        patterns: [
          {
            from: path.resolve('./node_modules/tiktoken/tiktoken_bg.wasm'),
            to: path.resolve('./.next/server/chunks/'),
          },
        ],
      })
    );

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
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Set-Cookie',
            value: '__vercel_live_token=YourTokenValue; Path=/; SameSite=None; Secure'
          }
        ]
      }
    ]
  },
  output: 'standalone', // This is important for Vercel deployments
}

const withMDX = createMDX({
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
})

export default withMDX(nextConfig)