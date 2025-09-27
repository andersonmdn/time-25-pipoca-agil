module.exports = function (api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        '@tamagui/babel-plugin',
        {
          components: ['tamagui'],
          config: './tamagui.config.ts',
        },
      ],
      // IMPORTANTE: o plugin do Reanimated deve ser o ÚLTIMO
      'react-native-reanimated/plugin',
    ],
  }
}
