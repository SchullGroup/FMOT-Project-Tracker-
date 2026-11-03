// Expo's Metro config, plus what expo-sqlite needs on the web (the screenshot build only): its .wasm file as an asset.
// The headers it also needs (SharedArrayBuffer) are set by the expo-router plugin in app.json. Native builds are
// unaffected.
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
config.resolver.assetExts.push('wasm');
module.exports = config;
