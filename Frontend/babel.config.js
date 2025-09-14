module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    ["module:react-native-dotenv",{
      "moduleName": "@env",
      "path": ".env",
    }],
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@screens': './src/screens',
          '@components': './src/components',
          '@navigation': './src/navigation',
          '@services': './src/services',
          '@styles': './src/styles',
          '@hooks': './src/hooks',
          '@utils': './src/utils',
          '@types': './src/types',
        },
      },
    ],
  ]
};