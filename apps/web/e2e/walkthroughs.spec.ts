// The walkthroughs in HANDOVER.md, on sample data (NEXT_PUBLIC_API_MOCK=1).
import { expect, test } from '@playwright/test';
import { choosePin, noErrors, signIn } from './helpers';

// Every walkthrough runs under the Content Security Policy (src/proxy.ts): anything it blocks fails the test.
let violations: string[] = [];
test.beforeEach(({ page }) => {
  violations = [];
  page.on('console', (m) => {
    if (/Content Security Policy|Refused to (load|execute|apply|connect|create)/i.test(m.text())) violations.push(m.text());
  });
});
test.afterEach(() => expect(violations).toEqual([]));

test('1. sign in, map home, find a project, tasks', async ({ page }) => {
  await page.goto('/sign-in');
  await page.getByLabel('Your mobile number').fill('0803 123 4567');
  await page.getByRole('button', { name: 'Text me a code' }).click();
  await page.getByLabel('Code').fill('123456');
  await page.getByRole('button', { name: 'Continue' }).click();
  // An easy PIN is refused; a good one signs in.
  await choosePin(page, '1111');
  await expect(page.getByRole('alert').first()).toBeVisible();
  await choosePin(page, '2580');
  await expect(page).not.toHaveURL(/sign-in/);

  // The map lists the corridors (also as buttons for keyboard and screen readers).
  await expect(page.getByRole('button', { name: /Kaduna–Kano/ }).first()).toBeAttached();
  await page.getByPlaceholder('Find a project or town').fill('Kaduna');
  await page.getByRole('button', { name: 'Find', exact: true }).click();
  await expect(page.getByText('Kaduna–Kano SGR').first()).toBeVisible();
  await noErrors(page);

  await page.getByRole('link', { name: 'Tasks' }).first().click();
  await expect(page).toHaveURL(/\/tasks/);
  await expect(page.locator('a[href^="/tasks?task="]').first()).toBeVisible();
});

test('2. every section of the project view loads', async ({ page }) => {
  await signIn(page);
  for (const section of ['', '/gates', '/corridor', '/photos', '/progress', '/payments', '/design', '/documents', '/land', '/issues', '/people', '/reports', '/activity']) {
    await page.goto(`/projects/p-kk${section}`);
    await expect(page.getByRole('heading').first()).toBeVisible();
    await noErrors(page);
  }
});

test('3. create a project through the six wizard steps', async ({ page }) => {
  await signIn(page);
  await page.goto('/projects/new');
  await page.getByLabel('Project name').fill('Kano–Maradi SGR');
  await page.getByLabel('Starts at').selectOption('Kano');
  await page.getByLabel('Ends at').selectOption('Maradi (Niger)');
  await page.getByRole('button', { name: 'Next', exact: true }).last().click();
  await expect(page).toHaveURL(/\/setup\//);

  await page.getByRole('radio', { name: /external loan/i }).check();
  await page.getByRole('button', { name: 'Next', exact: true }).last().click();

  await page.locator('input[type=file]').first().setInputFiles({ name: 'alignment.kml', mimeType: 'application/vnd.google-earth.kml+xml', buffer: Buffer.from('<kml/>') });
  await page.getByLabel('Station name').fill('Katsina');
  await page.getByLabel('At km').fill('190');
  await page.getByRole('button', { name: 'Add station' }).click();
  await expect(page.getByText('Katsina', { exact: true }).first()).toBeVisible();
  await page.getByRole('button', { name: 'Next', exact: true }).last().click();

  await page.getByLabel('NRC project engineer').selectOption({ label: 'Engr. K. Okafor, Nigerian Railway Corporation' });
  await page.getByRole('button', { name: 'Add to the project' }).click();
  await expect(page.getByText('Engr. K. Okafor').first()).toBeVisible();
  await page.getByRole('button', { name: 'Next', exact: true }).last().click();

  const pdf = (name: string) => ({ name, mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.7\n%%EOF\n') });
  await page.locator('input[type=file]').nth(0).setInputFiles(pdf('D01.pdf'));
  await page.locator('input[type=file]').nth(1).setInputFiles(pdf('D02.pdf'));
  await page.getByLabel('Date the Minister approved').fill('2026-10-20');
  await page.getByRole('button', { name: 'Mark gate 1 passed and continue' }).click();

  await page.getByRole('button', { name: /send for publishing/i }).click();
  await expect(page.getByText('Sent to the Director for publishing').first()).toBeVisible();
});

test('4. tasks: send back a photo, approve a certificate with the PIN, upload a document', async ({ page }) => {
  await signIn(page);
  await page.goto('/tasks');
  const count = () => page.locator('a[href^="/tasks?task="]').count();
  await expect.poll(count).toBe(7);

  // The flagged photo goes back with a reason.
  await page.goto('/tasks?task=t-photo');
  await page.getByRole('button', { name: /send back/i }).first().click();
  await page.getByRole('radio', { name: 'Outside the corridor' }).check();
  await page.getByRole('button', { name: /send back/i }).last().click();
  await expect(page.getByText(/sent back with your reason/i).first()).toBeVisible();

  // Certificate 14: an easy PIN is refused, then 2580 approves it.
  await page.goto('/tasks?task=t-cert');
  await page.getByRole('button', { name: /approve/i }).first().click();
  const pinBox = page.getByRole('dialog').getByLabel(/PIN/);
  await pinBox.fill('1111');
  await page.getByRole('dialog').getByRole('button', { name: /approve|confirm/i }).last().click();
  await expect(page.getByRole('dialog').getByRole('alert')).toBeVisible();
  await pinBox.fill('2580');
  await page.getByRole('dialog').getByRole('button', { name: /approve|confirm/i }).last().click();
  await expect(page.getByText(/approved/i).first()).toBeVisible();

  // The upload task needs the file and its date.
  await page.goto('/tasks?task=t-upload');
  await page.getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(page.getByText('Choose the file first.')).toBeVisible();
  await page.locator('input[type=file]').first().setInputFiles({ name: 'D12.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.7\n%%EOF\n') });
  await page.locator('input[type=date]').first().fill('2026-10-28');
  await page.getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(page.getByText(/submitted for confirmation/i).first()).toBeVisible();

  await page.goto('/tasks');
  await expect.poll(count).toBe(4);
});

test('5. administration: add a person, reset a PIN, hand over tasks, add an organisation, change a setting', async ({ page }) => {
  await signIn(page);
  await page.goto('/admin/users');
  await page.getByRole('button', { name: 'Add a person' }).click();
  await page.getByLabel('Full name').fill('Yusuf Bala');
  await page.getByLabel('Mobile number').fill('0803 555 0199');
  await page.getByLabel('Organisation').selectOption({ label: 'CCECC' });
  await page.getByLabel('Role').selectOption({ label: 'Site manager' });
  await page.getByRole('checkbox', { name: /Lot 3/ }).first().check();
  await expect(page.getByText(/director/i).first()).toBeVisible();
  await page.getByRole('button', { name: 'Send invite' }).click();
  await expect(page.getByRole('dialog')).toBeHidden();
  await noErrors(page);

  // A locked person's PIN is reset.
  await page.getByRole('button', { name: 'Ibrahim Sule' }).click();
  await page.getByRole('button', { name: 'Reset the PIN' }).click();
  await expect(page.getByText(/PIN is reset/).first()).toBeVisible();

  // Removing someone with open tasks needs a replacement first.
  await page.getByRole('button', { name: 'Engr. A. Bello' }).click();
  await page.getByRole('button', { name: /remove this person/i }).click();
  const remove = page.getByRole('dialog').getByRole('button', { name: /remove/i }).last();
  await expect(remove).toBeDisabled();
  await page.getByLabel('Hand their work to').selectOption({ index: 1 });
  await expect(remove).toBeEnabled();
  await page.getByRole('button', { name: 'Keep access' }).click();
  if (await page.getByRole('button', { name: 'Close' }).isVisible()) await page.getByRole('button', { name: 'Close' }).click();

  await page.goto('/admin/organisations');
  await page.getByRole('button', { name: 'Add an organisation' }).click();
  await page.getByLabel('Name', { exact: true }).fill('Mota-Engil Nigeria');
  await page.getByLabel('Kind of organisation').selectOption({ label: 'Contractor' });
  await page.getByRole('button', { name: 'Add organisation' }).click();
  await expect(page.getByRole('dialog')).toBeHidden();

  await page.goto('/admin/settings');
  const row = page.getByRole('listitem').filter({ hasText: /corridor width/i });
  await row.getByLabel(/corridor width/i).fill('400');
  await row.getByRole('button', { name: 'Save' }).click();
  await expect(row.getByRole('status')).toHaveText('Saved');
});

test('6. portfolio, reports and message settings', async ({ page }) => {
  await signIn(page);
  await page.goto('/portfolio');
  // Longest-waiting first: the stalled project leads.
  await expect(page.getByRole('row').nth(1)).toContainText(/Port Harcourt|stalled/i);
  await page.getByRole('button', { name: /pdf/i }).first().click();
  await expect(page.getByText(/being made|download/i).first()).toBeVisible();

  await page.goto('/projects/p-kk/documents');
  await expect(page.getByText(/expir/i).first()).toBeVisible();

  await page.goto('/settings/notifications');
  await page.getByLabel(/from/i).first().fill('22:00');
  await page.getByLabel(/until|to/i).first().fill('06:00');
  await page.getByRole('button', { name: /save/i }).first().click();
  await expect(page.getByText(/saved/i).first()).toBeVisible();
});

test('7. design requirements, programme revisions, practical completion, obligations', async ({ page }) => {
  await signIn(page);

  // Design: Lot 3 no longer needs three disciplines; the choice survives a reload.
  await page.goto('/projects/p-kk/design');
  const lot3 = ['Earthworks', 'Bridges and culverts', 'Stations'].map((d) => page.getByLabel(`${d} required for Lot 3`));
  for (const box of lot3) await expect(box).toBeChecked();
  for (const box of lot3) await box.uncheck();
  await page.getByRole('button', { name: 'Save what is required' }).nth(2).click();
  await expect(page.getByRole('status').filter({ hasText: 'Saved' })).toBeVisible();
  await page.reload();
  for (const box of lot3) await expect(box).not.toBeChecked();
  await noErrors(page);

  // Progress: Lot 3's first programme is used at once.
  await page.goto('/projects/p-kk/progress');
  const csv = { name: 'programme.csv', mimeType: 'text/csv', buffer: Buffer.from('discipline,month,planned_percent\nearthworks,2026-11,50\nearthworks,2026-12,60\n') };
  const lotSection = (n: number) => page.locator('section', { has: page.getByRole('heading', { name: new RegExp(`^Lot ${n},`) }) });
  // The blank template is made in the page (a blob: link), which the CSP allows.
  const download = page.waitForEvent('download');
  await lotSection(3).getByRole('button', { name: 'Get a blank template' }).click();
  expect((await download).suggestedFilename()).toBe('programme-lot-3.csv');
  await lotSection(3).locator('input[type=file]').setInputFiles(csv);
  await lotSection(3).getByRole('button', { name: 'Save the programme' }).click();
  await expect(lotSection(3).getByText('Programme saved. Planned figures now use it.')).toBeVisible();
  await expect(lotSection(3).getByText('First programme')).toBeVisible();

  // Lot 2's revision is refused without a reason, then sent with one and the approved extension of time.
  await lotSection(2).locator('input[type=file]').setInputFiles(csv);
  await lotSection(2).getByRole('button', { name: 'Send to the Director' }).click();
  await expect(lotSection(2).getByRole('alert')).toHaveText('Say why the programme is changing.');
  await lotSection(2).getByLabel('Why is it changing?').fill('Rains at the Rigasa cutting held the earthworks back six weeks.');
  await lotSection(2).getByLabel('Linked extension of time (optional)').selectOption({ label: 'Rains at the Rigasa cutting, km 70 to 74 (45 days)' });
  await lotSection(2).getByRole('button', { name: 'Send to the Director' }).click();
  await expect(lotSection(2).getByText(/sent to the Director/)).toBeVisible();
  await expect(lotSection(2).getByText('Follows: Rains at the Rigasa cutting, km 70 to 74')).toBeVisible();

  // Lot 1's practical completion, recorded with the PIN, waits for the Director.
  await lotSection(1).getByLabel('Completed on').fill('2026-10-30');
  await lotSection(1).getByRole('button', { name: /Record practical completion/ }).click();
  await page.getByRole('dialog').getByLabel(/PIN/).fill('2580');
  await page.getByRole('dialog').getByRole('button', { name: 'Record practical completion' }).click();
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(lotSection(1).getByText('Waiting for the Director')).toBeVisible();
  await noErrors(page);

  // Documents: an insurance with its expiry date joins the list.
  await page.goto('/projects/p-kk/documents');
  const expiring = page.locator('section', { has: page.getByRole('heading', { name: 'Bonds, guarantees and conditions that expire' }) }).locator('tbody tr');
  await expect(expiring.first()).toBeVisible();
  const before = await expiring.count();
  await page.getByRole('button', { name: 'Add one' }).click();
  await page.getByRole('dialog').getByLabel('Kind').selectOption('insurance');
  await page.getByRole('dialog').getByLabel('Reference').fill('CAR/2026/5531');
  await page.getByRole('dialog').getByLabel('What it covers (optional)').fill("Contractor's all risks, Lot 3");
  await page.getByRole('dialog').getByLabel('Expires on').fill('2027-03-31');
  await page.getByRole('dialog').getByRole('button', { name: 'Add', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(expiring).toHaveCount(before + 1);
  await expect(page.getByText("CAR/2026/5531: Contractor's all risks, Lot 3")).toBeVisible();
  await noErrors(page);
});
