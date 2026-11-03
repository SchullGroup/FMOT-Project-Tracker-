import Constants from 'expo-constants';

/*
 * Where the API is. A phone cannot reach "localhost" (that is the phone itself), so:
 * - EXPO_PUBLIC_API_URL wins when set, e.g. http://192.168.1.20:4000 (the API origin, without /api);
 * - otherwise the API is taken to run on the same computer as the Expo dev server, whose network address Expo Go
 *   already knows (it is how the phone loads the app), on port 4000.
 */
export function apiBaseUrl(envUrl: string | undefined = process.env.EXPO_PUBLIC_API_URL, hostUri: string | null | undefined = Constants.expoConfig?.hostUri): string {
  if (envUrl) return `${envUrl.replace(/\/+$/, '').replace(/\/api$/, '')}/api`;
  const host = hostUri?.split(':')[0];
  return `http://${host || 'localhost'}:4000/api`;
}

/** The support line on every screen. The number is a placeholder until the ministry's support desk has one. */
export const SUPPORT_PHONE = {
  shown: process.env.EXPO_PUBLIC_SUPPORT_PHONE_LABEL ?? '0700 RAIL 000',
  dial: process.env.EXPO_PUBLIC_SUPPORT_PHONE ?? '07007245000',
};
