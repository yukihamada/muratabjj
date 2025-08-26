const { withSentryConfig } = require("@sentry/nextjs");

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'vyddhllzjjpqxbouqivf.supabase.co'],
  },
  // ビルドパフォーマンスの最適化
  swcMinify: true, // SWCによる高速minification
  modularizeImports: {
    // lucide-reactのインポートを最適化
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{member}}',
    },
  },
  // 実験的機能でパフォーマンス向上
  experimental: {
    optimizePackageImports: ['lucide-react'], // 自動的にツリーシェイキング
  },
  // TypeScriptとESLintの並列実行
  typescript: {
    // ビルド時の型チェックを無効化（CI/CDで実行）
    ignoreBuildErrors: false,
  },
  eslint: {
    // ビルド時のlintを無効化（CI/CDで実行）
    ignoreDuringBuilds: false,
  },
  // Webpackの最適化
  webpack: (config, { isServer }) => {
    // 開発環境でのみソースマップを生成
    if (process.env.NODE_ENV === 'production') {
      config.devtool = false;
    }
    
    // node_modulesの変更を監視しない
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/node_modules/**', '**/.git/**'],
    };
    
    return config;
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