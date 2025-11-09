module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@microplanner/types': '../../packages/types/src',
            '@microplanner/config': '../../packages/config/src',
          },
        },
      ],
    ],
  };
};
