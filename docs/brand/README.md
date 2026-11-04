# The coat of arms

`coat-of-arms-nigeria.svg` is the coat of arms of Nigeria used as the project's logo: the web header (sign-in and
every page), the web favicon, the field app's icon, splash screen and the screens before sign-in (welcome, sign-in,
unlock).

- **Source:** [Wikimedia Commons, File:Coat of arms of Nigeria.svg](https://commons.wikimedia.org/wiki/File:Coat_of_arms_of_Nigeria.svg),
  drawn by Lumia1234, downloaded 3 November 2026 (1505 x 1276, no scripts or external links).
- **Licence of this drawing:** [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/). The PNGs made from it
  (below) are shared under the same licence. Credit: "Coat of arms of Nigeria by Lumia1234, Wikimedia Commons,
  CC BY-SA 3.0".
- **Use of the emblem:** Commons marks it as an insignia. Its use is governed by Nigerian law, apart from the
  drawing's copyright. The ministry should confirm it may appear on this system and, ideally, supply its official
  artwork; replace this file and regenerate the PNGs when it does.

## Files made from it

Rendered with Chromium (Playwright), the crest centred and never stretched:

| File | Size | What |
| --- | --- | --- |
| `apps/web/public/coat-of-arms.png` | 176 x 149, transparent | web header (shown at 36 and 44 px) |
| `apps/web/src/app/icon.png` | 256 x 256, transparent | web favicon (Next.js app icon) |
| `apps/mobile/assets/coat-of-arms.png` | 284 x 241, transparent | welcome, sign-in, unlock (80 points tall, 3x) |
| `apps/mobile/assets/icon.png` | 1024 x 1024, white, no transparency | app icon (iOS needs it opaque) |
| `apps/mobile/assets/splash-icon.png` | 1024 x 1024, transparent | splash, on white, 200 points wide |
| `apps/mobile/assets/android-icon-foreground.png` | 512 x 512, crest 62 percent wide | Android adaptive icon, inside the safe zone |
| `apps/mobile/assets/android-icon-background.png` | 512 x 512, white | Android adaptive icon background |
| `apps/mobile/assets/android-icon-monochrome.png` | 432 x 432, white silhouette | Android themed icon |
| `apps/mobile/assets/favicon.png` | 48 x 48 | the field app's web build |

Expo Go shows its own icon and loading screen, so the app icon and splash appear only in a built app.
