/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Handle bitcore-lib conflicts
    config.resolve.fallback = {
      ...config.resolve.fallback,
      crypto: false,
      stream: false,
      buffer: false,
    }

    // Ignore specific modules that cause conflicts on server side
    if (isServer) {
      config.externals = [...(config.externals || []), 'bitcore-lib']
    }

    return config
  },
  experimental: {
    esmExternals: true,
  },
  // Enable compression
  compress: true,
  // Performance optimizations
  swcMinify: true,
  // Reduce bundle size by removing unused code
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
      skipDefaultConversion: true,
    },
  },
}

export default nextConfig
