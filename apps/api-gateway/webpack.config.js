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
      // Don't polyfill Node.js globals - use native Node.js features
      fallback: {
        crypto: false,
      },
    },
    // Disable crypto polyfill warning
    plugins: [
      ...(options.plugins || []),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      }),
    ],
  };
};
