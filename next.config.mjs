import createMDX from '@next/mdx'
import path from 'path'
import fs from 'fs'

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  experimental: {
    mdxRs: true,
  },
  webpack: (config, { isServer }) => {
    // This allows importing of WebAssembly files
    config.experiments = { ...config.experiments, asyncWebAssembly: true };
    
    // Copy tiktoken_bg.wasm to the public directory during build
    if (isServer) {
      const tiktokenWasmPath = path.join(process.cwd(), 'node_modules', 'tiktoken', 'tiktoken_bg.wasm');
      const publicWasmPath = path.join(process.cwd(), 'public', 'tiktoken_bg.wasm');
      
      if (fs.existsSync(tiktokenWasmPath)) {
        fs.mkdirSync(path.dirname(publicWasmPath), { recursive: true });
        fs.copyFileSync(tiktokenWasmPath, publicWasmPath);
        console.log('Copied tiktoken_bg.wasm to public directory');
      } else {
        console.error('tiktoken_bg.wasm not found in node_modules');
      }
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
  output: 'standalone',
}

const withMDX = createMDX({
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
})

export default withMDX(nextConfig)