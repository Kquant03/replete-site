import createMDX from '@next/mdx'

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  experimental: {
    mdxRs: true,
  },
  webpack: (config, { isServer }) => {
    // Existing WebAssembly configuration
    config.experiments = { ...config.experiments, asyncWebAssembly: true };
    
    // Add WebAssembly rule
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'asset/resource',
    });

    // Add rule for pdf.worker.js
    if (!isServer) {
      config.module.rules.push({
        test: /pdf\.worker\.(min\.)?js/,
        type: 'asset/resource',
        generator: {
          filename: 'static/worker/[hash][ext][query]'
        }
      });
    }

    // Add support for PDF.js worker
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        stream: false,
        util: false,
        crypto: false,
        buffer: false,
        events: false,
        path: false,
        zlib: false,
        http: false,
        https: false,
        url: false,
      };
    }

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
  env: {
    TABBY_API_URL: process.env.TABBY_API_URL,
    TABBY_API_KEY: process.env.TABBY_API_KEY,
  }
}

const withMDX = createMDX({
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
})

// Merge MDX config with Next.js config
export default withMDX(nextConfig)