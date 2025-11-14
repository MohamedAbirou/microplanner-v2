const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = function (options, webpack) {
  return {
    ...options,
    externals: [
      nodeExternals({
        // Do NOT externalize workspace packages - bundle them into the output
        allowlist: [
          '@microplanner/database',
          '@microplanner/config',
          '@microplanner/types',
        ],
      }),
    ],
    resolve: {
      ...options.resolve,
      extensions: ['.ts', '.tsx', '.js', '.json'],
      alias: {
        '@microplanner/database': path.resolve(__dirname, '../../packages/database/src'),
        '@microplanner/config': path.resolve(__dirname, '../../packages/config/src'),
        '@microplanner/types': path.resolve(__dirname, '../../packages/types/src'),
      },
    },
    // Increase webpack memory limit
    optimization: {
      ...options.optimization,
      minimize: false, // Disable minification in development
    },
    // Add banner to prevent crypto polyfill
    plugins: [
      ...(options.plugins || []),
      new webpack.BannerPlugin({
        banner: '// Fix crypto polyfill issue\nif (typeof crypto === "undefined") { globalThis.crypto = require("crypto"); }',
        raw: true,
        entryOnly: true,
      }),
    ],
  };
};
