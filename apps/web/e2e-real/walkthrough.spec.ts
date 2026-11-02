/*
 * The web app against the real API on a Neon branch (not part of `pnpm --filter web test`, which uses sample data).
 * Start the API with the console SMS sender and WEB_BASE_URL=http://localhost:3000, its log in API_LOG; start the
 * web app on :3000; create the first IT administrator with `pnpm admin:create` and put its invite link in
 * ADMIN_INVITE. Then: pnpm --filter web test:real. It leaves its people and project on the branch.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { type Browser, expect, type Page, test } from '@playwright/test';

const API_LOG = process.env.API_LOG!;
const ADMIN_INVITE = process.env.ADMIN_INVITE!;
const KML = process.env.KML_FILE!;
const PIN = '2580';
// A run's people get numbers no earlier run used.
const run = String(Date.now()).slice(-3);
const phone = (n: number) => `0803555${run}${n}`;

test.describe.configure({ mode: 'serial' });
test.setTimeout(600_000);

// The console SMS sender logs "to +234803***1234: <text>". Texts go out just after the request, so a helper marks how
// many a number has had before the action and waits for a newer one.
const textsTo = (local: string) => readFileSync(API_LOG, 'utf8').split('\n').filter((l) => l.includes(`***${local.slice(-4)}:`));
const mark = (local: string) => textsTo(local).length;
async function sms(local: string, pattern: RegExp, since = 0): Promise<string> {
  for (let i = 0; i < 40; i++) {
    for (const l of textsTo(local).slice(since).reverse()) {
      const m = pattern.exec(l);
      if (m) return m[1]!;
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`No SMS matching ${pattern} for …${local.slice(-4)}`);
}
const codeFor = (local: string, since: number) => sms(local, /code is (\d{6})/, since);
const inviteFor = (local: string) => sms(local, /(\/invite\/[A-Za-z0-9._-]+)/);

async function acceptInvite(browser: Browser, path: string, local: string): Promise<Page> {
  const page = await (await browser.newContext()).newPage();
  await page.goto(path);
  const before = mark(local);
  await page.getByRole('button', { name: /send|text me|code/i }).first().click();
  await page.getByLabel('Code from the text message').fill(await codeFor(local, before));
  await page.getByLabel('New PIN').fill(PIN);
  await page.getByLabel('Type the PIN again').fill(PIN);
  await page.getByRole('button', { name: /set up|accept|continue|finish|done/i }).last().click();
  await expect(page).not.toHaveURL(/\/invite\//, { timeout: 30_000 });
  return page;
}

// Sign in on a new device: phone, the SMS code, then the PIN.
async function signIn(browser: Browser, local: string): Promise<Page> {
  const page = await (await browser.newContext()).newPage();
  await page.goto('/sign-in');
  await page.getByLabel('Your mobile number').fill(local);
  const before = mark(local);
  await page.getByRole('button', { name: /continue|next|send|text me/i }).first().click();
  await page.getByLabel('Code').fill(await codeFor(local, before));
  await page.getByRole('button', { name: /continue|next|check|sign in/i }).first().click();
  await page.getByLabel('PIN', { exact: true }).fill(PIN);
  await page.getByRole('button', { name: /sign in|continue/i }).first().click();
  await expect(page).not.toHaveURL(/\/sign-in/, { timeout: 30_000 });
  return page;
}

async function addPerson(page: Page, name: string, local: string, organisation: string, role: string, projectName?: string, lotName?: string) {
  await page.goto('/admin/users');
  await page.getByRole('button', { name: 'Add a person' }).click();
  await page.getByLabel('Full name').fill(name);
  await page.getByLabel('Mobile number').fill(local);
  await page.getByLabel('Organisation').selectOption({ label: organisation });
  await page.getByLabel('Role').selectOption({ label: role });
  if (projectName && lotName) await page.getByRole('checkbox', { name: new RegExp(lotName) }).check();
  else if (projectName) await page.getByRole('checkbox', { name: new RegExp(projectName) }).check();
  await page.getByRole('button', { name: 'Send invite' }).click();
  await expect(page.getByRole('dialog')).toBeHidden({ timeout: 20_000 });
}

async function addOrganisation(page: Page, name: string, kind: string) {
  await page.goto('/admin/organisations');
  await page.getByRole('button', { name: 'Add an organisation' }).click();
  await page.getByLabel('Name', { exact: true }).fill(name);
  await page.getByLabel('Kind of organisation').selectOption({ label: kind });
  await page.getByRole('button', { name: 'Add organisation' }).click();
  await expect(page.getByText(`${name} is added`)).toBeVisible({ timeout: 20_000 });
}

test('the web app against the real API: invites, wizard, publishing, project view, accounts', async ({ browser }) => {
  const pm = { name: `E2E Project Manager ${run}`, phone: phone(1) };
  const director = { name: `E2E Director ${run}`, phone: phone(2) };
  const nrc = { name: `E2E NRC Engineer ${run}`, phone: phone(3) };
  const site = { name: `E2E Site Manager ${run}`, phone: phone(4) };
  const ministry = `E2E Rail Directorate ${run}`;
  const nrcOrg = `E2E Nigerian Railway Corporation ${run}`;
  const contractor = `E2E CCECC ${run}`;

  // The IT administrator accepts the invite from admin:create and adds the ministry, NRC and three people.
  // The administrator's device (its id and the remembered phone, never the cookie, which rotates on every use) is
  // kept between runs: a known device signs in with the PIN alone, and the API allows only three codes per phone in
  // 15 minutes.
  const state = process.env.ADMIN_STATE;
  let admin: Page;
  if (state && existsSync(state)) {
    admin = await (await browser.newContext({ storageState: state })).newPage();
    await admin.goto('/sign-in');
    await admin.getByLabel('PIN', { exact: true }).fill(PIN);
    await admin.getByRole('button', { name: 'Sign in' }).click();
    await expect(admin).not.toHaveURL(/\/sign-in/, { timeout: 30_000 });
  } else {
    admin = ADMIN_INVITE ? await acceptInvite(browser, ADMIN_INVITE, '08035550101') : await signIn(browser, '08035550101');
  }
  if (state) writeFileSync(state, JSON.stringify({ cookies: [], origins: (await admin.context().storageState()).origins }));
  console.log(`[${new Date().toISOString().slice(11, 19)}] admin signed in`);
  await addOrganisation(admin, ministry, 'Ministry unit');
  await addOrganisation(admin, nrcOrg, 'Nigerian Railway Corporation');
  await addPerson(admin, pm.name, pm.phone, ministry, 'Project manager');
  await addPerson(admin, director.name, director.phone, ministry, 'Director, rail');
  await addPerson(admin, nrc.name, nrc.phone, nrcOrg, 'NRC project engineer');

  console.log(`[${new Date().toISOString().slice(11, 19)}] people added`);
  const pmPage = await acceptInvite(browser, await inviteFor(pm.phone), pm.phone);
  const directorPage = await acceptInvite(browser, await inviteFor(director.phone), director.phone);
  await acceptInvite(browser, await inviteFor(nrc.phone), nrc.phone);

  // The project manager creates a project through the six wizard steps and sends it for publishing.
  const projectName = `E2E Kano–Katsina–Maradi ${run}`;
  console.log(`[${new Date().toISOString().slice(11, 19)}] invites accepted`);
  await pmPage.goto('/projects/new');
  await pmPage.getByLabel('Project name').fill(projectName);
  await pmPage.getByLabel('Starts at').selectOption('Kano');
  await pmPage.getByLabel('Ends at').selectOption('Maradi (Niger)');
  await pmPage.getByLabel('Reference (optional)').fill('NRMP 2025, item 14');
  await pmPage.getByRole('button', { name: 'Next', exact: true }).last().click();
  await expect(pmPage).toHaveURL(/\/setup\/[0-9a-f-]+/, { timeout: 30_000 });
  const projectId = /\/setup\/([0-9a-f-]+)/.exec(pmPage.url())![1]!;

  // Step 2: funding route.
  await pmPage.getByRole('radio', { name: /external loan/i }).check();
  await pmPage.getByRole('button', { name: 'Next', exact: true }).last().click();

  // Step 3: the Kano–Katsina–Maradi alignment and a station.
  await pmPage.locator('input[type=file]').first().setInputFiles(KML);
  await expect(pmPage.getByText(/Katsina|Kano/).first()).toBeVisible({ timeout: 60_000 });
  await pmPage.getByLabel('Station name').fill('Katsina');
  await pmPage.getByLabel('At km').fill('190');
  await pmPage.getByRole('button', { name: 'Add station' }).click();
  await expect(pmPage.getByText('Katsina', { exact: true }).first()).toBeVisible({ timeout: 20_000 });
  await pmPage.getByRole('button', { name: 'Next', exact: true }).last().click();

  // Step 4: the NRC engineer.
  await pmPage.getByLabel('NRC project engineer').selectOption({ label: `${nrc.name}, ${nrcOrg}` });
  await pmPage.getByRole('button', { name: 'Add to the project' }).click();
  await expect(pmPage.getByText(nrc.name).first()).toBeVisible({ timeout: 20_000 });
  await pmPage.getByRole('button', { name: 'Next', exact: true }).last().click();

  // Step 5: D01, D02 and the date of the Minister's approval.
  const pdf = (name: string) => ({ name, mimeType: 'application/pdf', buffer: Buffer.from(`%PDF-1.7\n% ${name}\n${'0'.repeat(200)}\n%%EOF\n`) });
  const files = pmPage.locator('input[type=file]');
  await files.nth(0).setInputFiles(pdf('concept-note.pdf'));
  await expect(pmPage.getByText('Attached, version 1').first()).toBeVisible({ timeout: 20_000 });
  await files.nth(1).setInputFiles(pdf('minute.pdf'));
  await expect(pmPage.getByText('Attached, version 1')).toHaveCount(2, { timeout: 20_000 });
  await pmPage.getByLabel('Date the Minister approved').fill('2026-10-20');
  await pmPage.getByRole('button', { name: 'Mark gate 1 passed and continue' }).click();

  // Step 6: review and send.
  await pmPage.getByRole('button', { name: /send for publishing/i }).click();
  await expect(pmPage.getByText(/sent to the director/i).first()).toBeVisible({ timeout: 30_000 });

  console.log(`[${new Date().toISOString().slice(11, 19)}] sent for publishing`);
  // The Director publishes it from Tasks with the PIN.
  await directorPage.goto('/tasks');
  await directorPage.getByRole('link', { name: new RegExp(`Publish ${projectName}`) }).click();
  await directorPage.getByRole('button', { name: /publish/i }).first().click();
  await directorPage.getByRole('dialog').getByLabel(/PIN/).fill(PIN);
  await directorPage.getByRole('dialog').getByRole('button', { name: /confirm|publish|continue/i }).last().click();
  await expect(directorPage.getByText(/published/i).first()).toBeVisible({ timeout: 30_000 });

  console.log(`[${new Date().toISOString().slice(11, 19)}] published`);
  // Every project section loads (empty is fine).
  for (const section of ['', '/gates', '/corridor', '/photos', '/progress', '/payments', '/design', '/documents', '/land', '/issues', '/people', '/reports', '/activity']) {
    await directorPage.goto(`/projects/${projectId}${section}`);
    await directorPage.waitForLoadState('networkidle');
    await expect(directorPage.getByRole('heading').first()).toBeVisible();
    await expect(directorPage.getByText(/something went wrong|could not load|could not reach/i)).toHaveCount(0);
  }

  console.log(`[${new Date().toISOString().slice(11, 19)}] sections loaded`);
  // The IT administrator adds a contractor and a site manager; the Director confirms the account from Tasks.
  await addOrganisation(admin, contractor, 'Contractor');
  await addPerson(admin, site.name, site.phone, contractor, 'Site manager');
  await directorPage.goto('/tasks');
  await directorPage.getByRole('link', { name: new RegExp(site.name) }).click();
  await directorPage.getByRole('button', { name: /confirm/i }).first().click();
  await directorPage.getByRole('dialog').getByLabel(/PIN/).fill(PIN);
  await directorPage.getByRole('dialog').getByRole('button', { name: /confirm|continue/i }).last().click();
  await expect(directorPage.getByText(/confirmed/i).first()).toBeVisible({ timeout: 30_000 });
  // The invite goes out only now.
  expect(await inviteFor(site.phone)).toMatch(/^\/invite\//);
});
