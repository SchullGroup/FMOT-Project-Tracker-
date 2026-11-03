# Screens, against the Penpot boards

Taken on 3 November 2026 on real data: the API ran on a temporary copy of the Neon `demo` branch, signed in as the
demo site manager (0700 000 0112), the demo resident engineer (0700 000 0111) and the Director (0700 000 0103, for the
"for site staff" screen). The phone's position was set to Kaduna–Kano km 150+300 (Lot 3).

There is no Android emulator or iOS simulator on the build machine, so these were rendered by the app's web build in
Chromium at **Android** (Pixel 7, 412 x 915) and **iPhone** (iPhone 15, 393 x 852) sizes. Expo Go draws the same
layout natively; fonts and the switch control look slightly different there. Screens that scroll are captured to the
height of the screen.

| File | Screen | Board (page 06 Mobile) |
| --- | --- | --- |
| `*-m1-welcome.png` | M1: welcome, language, Large text | screens/m1-onboarding |
| `*-m1-permissions.png` | M1: camera and location, with why | none (screen map M1) |
| `*-m1-sign-in-phone.png`, `*-m1-sign-in-code.png`, `*-m1-sign-in-pin.png` | M1: number, SMS code, PIN keypad | screens/m1-onboarding |
| `*-m1-invite.png` | M1: the invite (taken in Step 1, when it asked for the pasted link; it now asks for the 8-character code) | screens/m1-onboarding |
| `*-m2-home.png`, `*-m2-home-large-text.png` | M2: site manager home (taken in Step 1, before the icons; `*-m2-home-sent.png` shows them) | screens/m2-home |
| `*-m9-re-home.png` | M9: resident engineer home | screens/m9-re-home |
| `*-m10-settings.png` | M10: settings | none (screen map M10) |
| `*-unlock.png` | Opening the app later with the PIN | none |
| `*-coming-soon.png` | Where next-step buttons lead | none |
| `*-not-for-you.png` | Anyone not on site | none |
| `*-m3-capture-camera.png` | M3: the camera, location locked, shutter open | screens/m3-capture (before the shot; the board shows after) |
| `*-m3-capture.png` | M3: after the shot, what is this, voice note, Retake, Send | screens/m3-capture |
| `*-m2-home-sent.png` | M2 after Send: "Photo sent, km 30+300" | screens/m2-home-sent |
| `*-m8-outbox-offline.png`, `*-m8-outbox.png` | M8: the outbox offline (Queued) and after the network returned | screens/m8-outbox |
| `*-m7-sent-back.png` | M7: what the engineer returned, with the reason and Retake | screens/m7-sent-back |

## Differences from the boards

**M1 onboarding.**
- The board has one screen with the invite SMS code, the PIN keypad, the language and Large text. The app splits it
  into four: welcome (language, Large text), permissions, sign-in or invite (number and SMS code), then the PIN. The
  brief asks for the permission prompts with their reasons, and the same PIN screen serves both sign-in and invite.
- The PIN keypad, dots and the language chips match the board. Hausa, Yorùbá and Igbo are shown but cannot be chosen
  until their files exist.
- There is no three-screen picture tutorial (screen map M1) yet.

**M2 home.**
- Layout, order, colours and wording follow the board: greeting and menu, current lot with the nearest chainage and
  GPS accuracy, Take photo, Today's report and Milestones side by side, Report incident, Sent back, Your photos with
  the four status chips and the last sync, Call support.
- No icons (camera, report, flag): the app has no icon set yet.
- Milestones says "Mark one complete" instead of "2 open · Next: culvert km 106": the API has no milestone list for a
  site manager yet (Step 3).
- Queued is always 0 until the outbox (Step 2) keeps photos on the phone.
- The red count badge on Sent back appears only when something was sent back; the ▾ lot picker only for someone on
  more than one lot.
- The board's 13 and 14 point captions are 16 points here, as the brief requires (body text 18).

**M9 resident engineer home.**
- Greeting, role line ("Resident engineer · TEAM Consultants · Lots 1 and 2") and the To verify count follow the
  board.
- The first photo in the queue is not shown yet; its box says so. The line under it has the lot instead of the
  discipline, because the review queue does not return the discipline.
- No swipe: Send back and Verify open the next-step screen. Milestones to verify and Tests witnessed are placeholders
  (the board shows "Embankment section 12 · Claimed" and "Concrete cubes · culvert C-15").
- The board's "Next: valuation" chip is a prototype aid and is not built.

**Step 2 screens (M3, M2 after Send, M8, M7)**, taken on 3 November 2026 the same way, signed in as the demo site
manager of Lot 1 (0700 000 0121) with the position at Kaduna–Kano km 30+300 and Chromium's fake camera (the green
picture). Lot 1 rather than Lot 3 because of the sign-in code limit during repeated runs; the flow is the same.
- **M3:** matches the board: the location badge, the close button, the photo, the blue chainage bar ("Chainage, live
  from GPS"; "when you last had signal" when it could not be refreshed), the six tiles with the board's icons, the
  voice note button, Retake and Send, and the outbox line. The board shows only the after-shot state; the camera
  screen before it (live viewfinder and a round shutter) has no board. The web build has no compass, so "heading NE"
  is missing there; phones show it.
- **M2 after Send:** the toast says "Photo sent, km 30+300" with OK, or "Saved. It will send when you have signal."
  The board's "Next: resident engineer" chip is a prototype aid and is not built.
- **M8:** the status key and the items with thumbnail, place, time, state and chip, as on the board. Added: Try again
  for an item the API did not accept, the space used, Send now, Clear verified, and the line saying photos send only
  while the app is open. The board's "Lot 2 ·" before the sync time is left out (the outbox can hold more than one lot).
- **M7:** title with the count, the line, and each item's place and discipline, who sent it back and when, the Sent
  back chip, the reason and Retake, as on the board. Photos taken before this step, or on another phone, have no
  thumbnail on this phone and show a picture icon instead.

**M10 settings, unlock, coming soon, not for you.** No boards exist; they follow the type, colours and button styles
of the boards above. M10 has language, Large text, fingerprint or face, Call support and Sign out; changing the PIN
and phone binding (screen map M10) come later.
