// Metro バンドラーの設定（Expo SDK 52）
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

module.exports = config;
