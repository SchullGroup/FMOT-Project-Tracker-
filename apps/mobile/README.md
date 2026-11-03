# FMoT Field (the mobile app)

The field app for contractor site managers and consultant resident engineers: Expo SDK 58, TypeScript strict,
Expo Router, run in **Expo Go** on Android and iPhone. In-house only: nothing is published to the stores. Anyone with
another role who signs in is told to use the website.

This first step has sign-in, the first-run screens (M1), the site manager's home (M2), the resident engineer's home
(M9) and settings (M10). Buttons for the camera, today's report, milestones, incidents and the review queue open a
"coming in the next step" screen.

## Try it on your phone

1. **Expo Go.** Install or update Expo Go from the App Store or Google Play. It must support SDK 58 (the App Store
   version 58.0.5 of 22 October 2026 does). Expo Go runs one SDK at a time, so an older Expo Go cannot open the app.
2. **Same Wi-Fi.** Put the phone on the same Wi-Fi as the Mac. Guest networks that keep devices apart do not work;
   a phone hotspot that the Mac joins does.
3. **The API, on the demo branch.** The demo people (docs/demo-data.md) are on the Neon branch `demo`. In
   `apps/api`, after `pnpm build`:

   ```sh
   DATABASE_URL_UNPOOLED="$(neon connection-string demo --project-id wild-paper-65564975)" \
   DATABASE_URL="$(neon connection-string demo --project-id wild-paper-65564975 --pooled)" \
   NEON_BRANCH=demo SMS_PROVIDER=console node dist/main.js
   ```

   It listens on every network interface (`HOST`, default `::`) on port 4000. The first time, macOS may ask whether
   `node` may accept incoming connections: choose **Allow**, or the phone cannot reach it. Sign-in codes are printed
   in this window, not texted.
4. **The app.** From the repository root: `pnpm mobile` (or `pnpm --filter mobile start`). A QR code appears.
   On an iPhone, scan it with the Camera app; on Android, scan it from Expo Go.
5. **Sign in** with a demo phone and the demo PIN **4826**:
   - site manager: **0700 000 0112** (Musa Garba, Kaduna–Kano Lot 3);
   - resident engineer: **0700 000 0111** (Engr. T. Adeyemi, Lots 1 and 2).

   Press Text me a code, read the 6-digit code from the API window (`to +234700***0112: Your FMoT Rail Tracker code
   is …`), then enter the PIN. The API allows three codes per phone every 15 minutes.

## The API address

A phone cannot reach `localhost`: on the phone, that is the phone. The app works out the API address like this
(`src/lib/config.ts`):

- `EXPO_PUBLIC_API_URL`, when set: the API's origin without `/api`, for example
  `EXPO_PUBLIC_API_URL=http://192.168.1.20:4000 pnpm mobile`.
- Otherwise the Mac that serves the app (Expo Go already knows its network address) on port 4000.

`EXPO_PUBLIC_SUPPORT_PHONE` and `EXPO_PUBLIC_SUPPORT_PHONE_LABEL` set the Call support number. The default,
0700 RAIL 000 (07007245000), is a placeholder from the design until the support desk has a real line.

## Sign-in on a phone

The same API as the web, as a mobile client (`src/lib/api.ts`):

- every request says `X-Client: mobile`, so sign-in and refresh return the refresh token in the body. It is kept only
  in `expo-secure-store` (the keychain or keystore); the 15-minute access token only in memory;
- a device id made on first run and kept in secure storage, so the API binds the phone to the person;
- the number, the SMS code, then the PIN (entered, or set twice). An invite is accepted by pasting the link (or its
  code) from the invite text message: the code is about 80 characters, too long to type, and deep links are left for
  a later step because they are unreliable in Expo Go;
- refresh on an ended session, once, shared by every request waiting on it; a failed refresh signs out. A wrong PIN is
  never retried;
- on later days the app opens locked: the PIN (checked by the API, so five wrong ones lock the account), or the
  fingerprint or face once the person has turned that on (offered after the PIN is first set, and in Settings).

## Commands

- `pnpm --filter mobile start`: the Expo dev server and QR code.
- `pnpm --filter mobile test`: unit tests (jest-expo), for the API client and the screen helpers.
- `pnpm --filter mobile typecheck`.
- `pnpm --filter mobile doctor`: Expo's dependency checks.
- `pnpm tokens` (root): rewrites `src/theme/tokens.ts` from `tools/penpot-ds-tokens.json`, with the web theme.

## What does not work in Expo Go

- **Face ID on iPhone.** Expo Go cannot use Face ID, so on an iPhone the "fingerprint or face" shortcut asks for the
  phone's passcode instead. Touch ID and Android fingerprint and face unlock work. A development build fixes this.
- **The app's own permission wording.** The camera, location and Face ID texts in `app.json` only appear in a built
  app; Expo Go shows its own. The app's sentences on why each permission is needed (M1) still show.
- **Links from text messages** (invites) do not open the app yet; paste the link instead.
- Nothing else in this step needs a development build. Every module used is in Expo Go: camera, location, SQLite,
  secure storage, local authentication, file system, image manipulator, network, localization and fonts.

## Layout of the code

- `src/app/`: one file per screen (Expo Router). `_layout.tsx` picks which screens a person can reach: first run,
  signed out, locked or open.
- `src/session/`: who is signed in, settings, and the shared API client.
- `src/lib/`: the API client, storage, field data, formatting.
- `src/i18n/`: every word, one file per language (`en.ts` now; Hausa, Yorùbá and Igbo files later, same keys).
- `src/theme/`: colours, spacing and type from the design tokens. Text is never below 16 points, body text is 18, and
  Large text uses the tokens' Large text sizes (25 percent larger).
- `src/lib/storage.web.ts`: the web build exists only to take screenshots at phone sizes on a computer
  (`docs/screens/`). It keeps everything in the browser tab's session storage, and is never given to anyone.
