import { expect, type Page } from '@playwright/test';

// The sample-data number that sees every area (src/lib/demo-accounts.ts): the walkthroughs cross several roles.
export const EVERY_AREA = '0700 000 0199';

// Sample-data sign-in: a test number, the code 000000 and the PIN 4826.
export async function signIn(page: Page, phone = EVERY_AREA) {
  await page.goto('/sign-in');
  await page.getByLabel('Your phone number or email address').fill(phone);
  await page.getByRole('button', { name: 'Send me a code' }).click();
  await page.getByLabel('Code').fill('000000');
  await page.getByRole('button', { name: 'Continue' }).click();
  await enterPin(page, '4826');
  await expect(page).not.toHaveURL(/sign-in/);
}

export async function enterPin(page: Page, pin: string) {
  await page.getByLabel('PIN', { exact: true }).fill(pin);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
}

// No error text anywhere on the page.
export async function noErrors(page: Page) {
  await expect(page.getByText(/something went wrong|could not load|could not reach/i)).toHaveCount(0);
}
