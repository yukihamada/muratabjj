const { withSentryConfig } = require("@sentry/nextjs");

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'vyddhllzjjpqxbouqivf.supabase.co'],
  },
}

module.exports = withSentryConfig(
  nextConfig,
  {
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options

    // Suppresses source map uploading logs during build
    silent: true,
    
    // Hides source maps from generated client bundles
    hideSourceMaps: true,
    
    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,
  }
)