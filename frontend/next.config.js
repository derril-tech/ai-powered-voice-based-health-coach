/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  
  // Enable SWC minification for faster builds
  swcMinify: true,
  
  // Configure experimental features
  experimental: {
    // Enable app directory (Next.js 13+)
    appDir: true,
    
    // Enable server components
    serverComponentsExternalPackages: ['@prisma/client'],
    
    // Enable optimized images
    optimizeCss: true,
    
    // Enable font optimization
    fontLoaders: [
      { loader: '@next/font/google', options: { subsets: ['latin'] } }
    ],
  },
  
  // Configure images
  images: {
    domains: [
      'localhost',
      '127.0.0.1',
      'api.voiceassistant.com',
      'cdn.voiceassistant.com',
      'avatars.githubusercontent.com',
      'lh3.googleusercontent.com',
      'graph.facebook.com',
    ],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Configure webpack for additional optimizations
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle size
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
          },
        },
      };
    }
    
    // Handle audio files
    config.module.rules.push({
      test: /\.(mp3|wav|m4a|ogg)$/,
      use: {
        loader: 'file-loader',
        options: {
          publicPath: '/_next/static/audio/',
          outputPath: 'static/audio/',
        },
      },
    });
    
    return config;
  },
  
  // Configure environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Configure headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
    ];
  },
  
  // Configure redirects
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
  
  // Configure rewrites for API proxy
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/:path*`,
      },
    ];
  },
  
  // Configure PWA settings
  pwa: {
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development',
  },
  
  // Configure TypeScript
  typescript: {
    // Enable type checking during build
    ignoreBuildErrors: false,
  },
  
  // Configure ESLint
  eslint: {
    // Enable ESLint during build
    ignoreDuringBuilds: false,
  },
  
  // Configure output
  output: 'standalone',
  
  // Configure trailing slash
  trailingSlash: false,
  
  // Configure base path
  basePath: '',
  
  // Configure asset prefix
  assetPrefix: process.env.NODE_ENV === 'production' ? 'https://cdn.voiceassistant.com' : '',
  
  // Configure compression
  compress: true,
  
  // Configure powered by header
  poweredByHeader: false,
  
  // Configure i18n (internationalization)
  i18n: {
    locales: ['en', 'es', 'fr', 'de'],
    defaultLocale: 'en',
    localeDetection: true,
  },
  
  // Configure onDemandEntries for development
  onDemandEntries: {
    // Period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
};

module.exports = nextConfig;
