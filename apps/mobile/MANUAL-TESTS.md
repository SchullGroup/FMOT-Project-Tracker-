# Manual tests: Mobile Step 3

A short checklist for trying the new screens by hand on a phone, against the demo data (docs/demo-data.md).

## Before you start

- The Mac runs the API and the web app on the demo branch (`pnpm dev`) and the mobile dev server (`pnpm mobile`). The phone is on the same Wi-Fi and opens the app in Expo Go (README: Try it on your phone).
- Every demo account's PIN is **4826**. The sign-in code is in the API window on the Mac (`Your FMoT Rail Tracker code is ...`).
- Two accounts, on Kaduna–Kano Lot 3:
  - **Site manager:** Musa Garba, **0700 000 0112**.
  - **Resident engineer:** Engr. R. Nwosu, **0700 000 0119**.
- To switch accounts: Settings (☰), Sign out, then sign in with the other number.
- Location must be allowed. You do not need to be near the line for most tests: away from it, items are flagged by the checks (outside the corridor), which is fine. The one exception is **Verify on site**, which only verifies when every check passes, so it needs a phone on the line (or see the note in that section).

## Site manager (0700 000 0112)

### M4 Today's report

1. Home shows **Today's report: Not sent**. Tap it.
2. The first time, the line under the title says **Your first report for Lot 3**. Set workers with **+** and **−** (or type a number). Add two machines (for example "Excavator EX-04", "Roller RL-07") and leave both ticked. Choose a weather tile. Answer **Any problem today?** with **Yes**, hold the voice note button for a few seconds, play it back.
3. **Send report** stays greyed out until the weather and the problem question are answered.
4. Send. Home shows **Sent** (or **Saved, sends with signal** for a moment).
5. Open the report again: the line says **Today's report is sent. Sending again replaces it.** The workers, machines and weather are filled from what you sent. Change the workers and send again. On the website (sign in as the project manager, 0700 000 0104), Kaduna–Kano, Photos and reports shows one report for today, the newer one.

### M5 Milestones

1. Home's Milestones card shows **2 open** and the next one along the line.
2. Tap it: the list runs by chainage (Earthworks complete to km 190, then Kano station foundations), each **Open**.
3. Tap **Earthworks complete to km 190**: it opens with the two-photo note and **Mark complete**.
4. Mark complete: the camera asks for the first photo, then **Now a second photo from another angle**. After the second, the first shows as a small picture beside the milestone's name. Send the claim.
5. Back on the list, the milestone reads **Claimed · on this phone**, then **Claimed · waiting for the RE** once sent. Home now shows **1 open**.

### M6 Report incident

1. Home, **Report incident**. The line under the title shows the lot, the chainage when there is signal, "location locked" and the time.
2. **Send incident** stays greyed out until a type is chosen and there is a photo or a voice note.
3. Choose **Accident**, **Add photo**, take it, **Use this photo**. Back on the incident screen the photo shows as **Photo added**. Send.
4. The screen says **Incident sent: The resident engineer, the project manager and the security desk have been told.** Back to home. Your photos lists it as **Incident: Accident** with its chainage.
5. Report a second one: **Security**, voice note only, Send. After it is sent it does **not** appear in Your photos at all, and no place is shown for it anywhere on the phone. On the website, the security desk (0700 000 0114) sees it under Incidents with its place.

### Offline: report and incident

1. With the app open on the home screen, turn on airplane mode (Wi-Fi off).
2. Send a daily report (any answers). Home shows **Saved, sends with signal**; Your photos shows it as **Queued**.
3. Report an incident (Equipment, a voice note). The screen says **Incident saved**, that it goes before anything else when there is signal, and to call the security desk if anyone is in danger.
4. Turn airplane mode off. Within about 30 seconds (or press **Send now** in Your photos) both go: the **incident first**, then the report. The report shows **Sent** on home.

## Resident engineer (0700 000 0119)

### M9 review queue

1. Home shows **To verify · n items** with one card: the photo, the chainage, what it is, who sent it and when, and the checks in plain words. Ticks are green, warnings amber, failures red. The **Phone** check on anything taken in Expo Go is **grey: "Not checked on test phones"**, never amber.
2. A flagged item says so in red above the checks.
3. **Verify** and **Send back** are at the bottom of the screen, always in view, without scrolling.
4. Tap **Verify**: "Verified. Here is the next one." and the next card shows.
5. Tap **Send back**: the reasons appear (Photo unclear, Wrong chainage, ...). **Send back** stays greyed out until you pick one. Pick one and send: the next card shows. Signed in again as Musa, Sent back on home has it with that reason.
6. The daily report from Musa shows as a card with its answers (workers, machines, weather, problem).

### Verify on site

1. **Milestones to verify** lists Musa's claim (Earthworks complete to km 190, km 190+000, claimed at its time), with **Verify on site**. (The demo's Zaria station claim is Lot 2, not Engr. Nwosu's.)
2. Tap **Verify on site**: the camera says "Verify on site: Earthworks complete to km 190. Your photo verifies it." Take the photo, choose a tile, Send.
3. On the line (all checks pass): once it has gone, bring the home screen back into view (open Settings and come back). The claim has left both the card queue and Milestones to verify. Signed in again as Musa, Milestones shows it **Verified**.
4. Away from the line, the photo is flagged (outside the corridor), so it does not count as an on-site check and the claim stays. To finish the test from your desk, verify the claim from its card instead: it shows both photos' first picture and "Milestone claimed: Earthworks complete to km 190"; **Verify** marks the milestone verified the same way.

### Nothing left of "coming in the next step"

- On both homes, every button opens a real screen: Today's report, Milestones, Report incident, Verify on site, Verify, Send back.
