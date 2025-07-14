/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    rules: {
      '*.svg': {
        loaders: [
          {
            loader: '@svgr/webpack',
            options: {
              icon: true,
            },
          },
        ],
        as: '*.js',
      },
    },
  },

  // Use Webpack for production builds (more stable)
  webpack: (config, { dev, isServer }) => {
    // Only apply webpack optimizations in production
    if (!dev) {
      // Add any production-specific webpack optimizations here
      config.optimization = {
        ...config.optimization,
        // Enable tree shaking and other optimizations
        usedExports: true,
        sideEffects: false,
      };
    }
    return config;
  },
  // env: {
  //   DB_HOST: process.env.DB_HOST,
  //   DB_USER: process.env.DB_USER,
  //   DB_PASSWORD: process.env.DB_PASSWORD,
  //   DB_NAME: process.env.DB_NAME,
  //   PAYMENT_API_NAME: process.env.PAYMENT_API_NAME,
  //   PAYMENT_API_KEY_PRO: process.env.PAYMENT_API_KEY_PRO,
  //   PAYMENT_URL_PROD: process.env.PAYMENT_URL_PROD,
  //   PAYMENT_CALLBACK_URL: process.env.PAYMENT_CALLBACK_URL,
  //   MERCHANT_ID: process.env.MERCHANT_ID,
  //   JWT_SECRET: process.env.JWT_SECRET,
  // },
}

module.exports = nextConfig