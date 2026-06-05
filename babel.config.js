// Babel 設定。Expo（Metro）と Jest の両方で使われます。
// babel-preset-expo が JSX/TypeScript/Flow などを変換します。
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
