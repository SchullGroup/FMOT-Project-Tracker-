import { expect, type Page } from '@playwright/test';

// Sample-data sign-in: any phone, code 123456, any PIN that is not an easy one.
export async function signIn(page: Page, pin = '2580') {
  await page.goto('/sign-in');
  await page.getByLabel('Your mobile number').fill('0803 123 4567');
  await page.getByRole('button', { name: 'Text me a code' }).click();
  await page.getByLabel('Code').fill('123456');
  await page.getByRole('button', { name: 'Continue' }).click();
  await choosePin(page, pin);
  await expect(page).not.toHaveURL(/sign-in/);
}

// A new browser has no PIN yet in sample mode: choose one (typed twice).
export async function choosePin(page: Page, pin: string) {
  await page.getByLabel('New PIN').fill(pin);
  await page.getByLabel('Type the PIN again').fill(pin);
  await page.getByRole('button', { name: 'Save PIN and sign in' }).click();
}

// No error text anywhere on the page.
export async function noErrors(page: Page) {
  await expect(page.getByText(/something went wrong|could not load|could not reach/i)).toHaveCount(0);
}
