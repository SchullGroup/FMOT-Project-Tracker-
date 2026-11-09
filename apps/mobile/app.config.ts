import type { ConfigContext, ExpoConfig } from 'expo/config';

// app.json holds the app's settings. This file adds one only for the Wi-Fi test build (eas.json profile lan-test):
// Android refuses plain http by default, and that build talks to the API on a Mac on the same network
// (http://<the Mac's address>:4000). Every other build keeps https only.
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...(config as ExpoConfig),
  plugins: [...(config.plugins ?? []), ['expo-build-properties', { android: { usesCleartextTraffic: process.env.FMOT_ALLOW_HTTP === '1' } }]],
});
