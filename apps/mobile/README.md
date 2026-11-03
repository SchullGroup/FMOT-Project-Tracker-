# FMoT Field (the mobile app)

The field app for contractor site managers and consultant resident engineers: Expo SDK 58, TypeScript strict,
Expo Router, run in **Expo Go** on Android and iPhone. In-house only: nothing is published to the stores. Anyone with
another role who signs in is told to use the website.

So far: sign-in and the first-run screens (M1), the site manager's home (M2), the camera (M3), sent back (M7), the
outbox (M8), the resident engineer's home (M9) and settings (M10). Buttons for today's report, milestones, incidents
and the review queue open a "coming in the next step" screen.

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
6. **Take a photo.** Stand somewhere with a clear sky and press Take photo. The demo lots are on the Kaduna–Kano line,
   so away from it the photo still sends but arrives flagged as outside the corridor.

## Test the outbox offline on your phone

1. Sign in as the site manager and leave the app on the home screen.
2. Turn on **airplane mode** (on an iPhone, also turn Wi-Fi off if it stays on).
3. Take **three photos**: each time choose what it is and press Send. Each time the home screen says "Saved. It will
   send when you have signal", and Your photos shows Queued 1, 2, 3.
4. **Close the app completely** (swipe it away), then open it again from Expo Go and enter the PIN. The three photos
   are still in Your photos, Queued.
5. Turn **airplane mode off** and keep the app open on Your photos. Within about 30 seconds they go Sending, then
   Checked, pending RE, one at a time. The resident engineer (0700 000 0111 for Lots 1 and 2, 0700 000 0119 for
   Lot 3) sees them in the queue.

The Mac running the API must stay on and on the same Wi-Fi. Photos only send while the app is open (Expo Go cannot
upload in the background); they wait safely if it is closed.

## The API address

A phone cannot reach `localhost`: on the phone, that is the phone. The app works out the API address like this
(`src/lib/config.ts`):

- `EXPO_PUBLIC_API_URL`, when set: the API's origin without `/api`, for example
  `EXPO_PUBLIC_API_URL=http://192.168.1.20:4000 pnpm mobile`.
- Otherwise the Mac that serves the app (Expo Go already knows its network address) on port 4000.

`EXPO_PUBLIC_SUPPORT_PHONE` and `EXPO_PUBLIC_SUPPORT_PHONE_LABEL` set the Call support number. The default,
0700 RAIL 000 (07007245000), is a placeholder from the design until the support desk has a real line.

## Capture and the outbox

- **M3 camera** (`src/app/capture.tsx`): the app's own camera only, no gallery. The shutter opens once the location
  is 25 m or better ("Location locked, about 8 m"), or after 60 seconds with a weak-location warning that travels
  with the photo. The photo carries the phone's time, latitude, longitude, accuracy, heading, the mock-location flag,
  the device id, the lot and the chainage the phone showed. After the shot: the six what-is-this tiles, a voice note
  (hold to record, up to 60 seconds), Retake, Send. The photo is shrunk to 2048 px on its long side (JPEG 0.8), with a
  400 px thumbnail.
- **The outbox** (`src/outbox/outbox.ts`, unit-tested against a real SQLite file): a SQLite table on the phone, one row
  per item keyed by a client id made on the phone. Send moves the files into the app's document folder first, so
  closing the app, restarting the phone or low storage cannot lose them. The sender runs when the app opens, when the
  network comes back and every 30 seconds while open; one item at a time to `POST /field/submissions`, waiting 30 s,
  2 min, 10 min, then every 30 min after failures. The API is idempotent on the client id, so a retry never makes a
  duplicate. Once accepted, the full-size photo and voice note are deleted; the thumbnail stays until the engineer
  verifies it. Older than 24 hours: a warning; older than 72 hours: "too old", not sent.
- **Statuses** come from `GET /field/my-submissions?since=`: Queued (on the phone), Sent, Checked, pending RE,
  Verified, Sent back with the reason (M8, and the four counts on M2).
- **Whose items:** each item belongs to the person who took it. Signing out with unsent photos warns first and keeps
  them for that person; anyone else signing in on the phone neither sees nor sends them.
- **M7 sent back:** the reason and Retake; the new photo carries `supersedes_id`.

## Sign-in on a phone

The same API as the web, as a mobile client (`src/lib/api.ts`):

- every request says `X-Client: mobile`, so sign-in and refresh return the refresh token in the body. It is kept only
  in `expo-secure-store` (the keychain or keystore); the 15-minute access token only in memory;
- a device id made on first run and kept in secure storage, so the API binds the phone to the person;
- the number, the SMS code, then the PIN (entered, or set twice). An invite is accepted with the 8-character code in
  the invite text message (ABCD-2345; a pasted link works too). Deep links are left for a later step because they are
  unreliable in Expo Go;
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
- **Links from text messages** (invites) do not open the app yet; type the short code instead.
- **Uploads in the background.** Expo Go cannot upload while the app is closed or in the background, so photos send
  while it is open. A development build could add background uploads later.
- **Device integrity.** Expo Go cannot ask Google Play Integrity or Apple App Attest, so every photo arrives with the
  "no integrity verdict" warning.
- Nothing else needs a development build. Every module used is in Expo Go: camera, location, SQLite, secure storage,
  local authentication, file system, image manipulator, network, localization, audio, fonts and icons (lucide with
  react-native-svg).

## iPhone and Android differences

- **Mock location:** Android says when a mock-location app supplies the position, and the API then flags the photo.
  iPhones only report it when software simulates the location, so the check catches less there.
- **Face ID** falls back to the passcode in Expo Go (above); Android fingerprint and face unlock work.
- **Shutter sound:** some iPhones (by region) always play it; Android follows the phone's sound setting.
- **Airplane mode:** on an iPhone, Wi-Fi often stays on in airplane mode; turn it off too to test offline.
- **Microphone:** both ask the first time a voice note is held; on an iPhone the silent switch does not stop playback
  of the note, because the app sets plays-in-silent-mode.
- **Permission wording** in the system prompts is Expo Go's on both, not the app's.

## Layout of the code

- `src/app/`: one file per screen (Expo Router). `_layout.tsx` picks which screens a person can reach: first run,
  signed out, locked or open.
- `src/session/`: who is signed in, settings, and the shared API client.
- `src/lib/`: the API client, storage, field data, formatting.
- `src/i18n/`: every word, one file per language (`en.ts` now; Hausa, Yorùbá and Igbo files later, same keys).
- `src/theme/`: colours, spacing and type from the design tokens. Text is never below 16 points, body text is 18, and
  Large text uses the tokens' Large text sizes (25 percent larger).
- `src/outbox/`: the outbox, its SQLite and file connections (`device.ts`), and the sender (`OutboxProvider.tsx`).
- `src/lib/storage.web.ts`, `src/outbox/device.web.ts`, `metro.config.js`: the web build exists only to take
  screenshots at phone sizes on a computer (`docs/screens/`) and to drive the screens in a browser with a fake camera
  and location. It keeps everything in the browser tab, runs SQLite in the browser, and is never given to anyone.
