import { ApiError } from './api';

/*
 * Plain-language messages for the API's error codes. Every error from the API
 * is { statusCode, code, message } (apps/api/src/common/errors.ts); the codes
 * below are stable. A code without a line here shows the API's own message,
 * which is written to be read.
 */
const MESSAGES: Record<string, string> = {
  code_incorrect: 'That code is not right. Check the latest text message or email we sent you and try again.',
  code_expired: 'That code has expired. Ask for a new one.',
  too_many_requests: 'Too many tries. Wait a minute, then try again.',
  pin_incorrect: 'That PIN is not right.',
  pin_too_easy: 'Choose a PIN that is harder to guess. Avoid repeated or running digits like 1111 or 1234.',
  account_locked: 'Your account is locked after too many wrong PINs. Call the IT support desk to unlock it.',
  device_unknown: 'This device is new. We will send you a code first.',
  invite_expired: 'This invite link or code is not valid, or it has expired. Check it, or ask the IT support desk to send a new one.',
  invite_used: 'This invite has already been used. Sign in with your phone number instead.',
  pin_confirmation_required: 'This needs your PIN. Press the button again and enter it.',
  pin_confirmation_used: 'That PIN confirmation was already used. Enter your PIN again.',
  task_done: 'This task has already been dealt with.',
  not_allowed: 'You cannot do this on this item.',
  phone_invalid: 'Enter a Nigerian mobile number, for example 0803 123 4567.',
  email_invalid: 'Enter a full email address, for example name@example.com.',
  email_required: 'To send codes by email, enter the email address.',
  email_taken: 'Someone already has this email address.',
  pin_not_set: 'Set your PIN first: ask for a code and choose a PIN.',
  device_not_bound: 'This phone is not registered to you. Sign in on it with a code first.',
  unauthorized: 'Your session has ended. Sign in again.',
  not_found: 'That item is not there, or you cannot see it.',
  validation_failed: 'Some of the details are not right. Check them and try again.',
  own_item: 'You cannot decide on something you submitted or created.',
  one_step_per_person: 'You have already acted on this item at another step; someone else must take this one.',
  organisations: 'The approvers on a payment certificate must come from at least three organisations.',
  role: 'This step is for a different role.',
  scope: 'This item is outside the projects you work on.',
  relation: 'This step is for the people on this lot or project.',
  documents_missing: 'Some required documents are not attached yet.',
  prerequisite_not_passed: 'An earlier gate has to pass first.',
  parcels_unpaid: 'Every land parcel in this section must be paid before it can be signed off.',
  passes_by_rule: 'This gate passes on its own when its conditions are met.',
  rework_reason_required: 'Taking complete work back to in progress needs a reason.',
  reason_required: 'Give the reason for this change.',
  revision_pending: 'A revision is already waiting for the Director.',
  outside_lot: 'That stretch is outside the lot.',
  link_expired: 'That link has expired. Open the file again.',
  link_invalid: 'That link is not valid. Open the file again.',
  organisation_exists: 'An organisation with this name already exists.',
  payload_too_large: 'That file is too large.',
  unsupported_media_type: 'That kind of file is not accepted here.',
  internal_error: 'Something went wrong on our side. Try again, or call the IT support desk.',
};

// Too many sign-in codes asked for (when SIGNIN_CODE_LIMIT is on): the API says when the next one is allowed.
function tooMany(error: ApiError): string {
  const seconds = Number(error.details.retryAfterSeconds);
  if (!(seconds > 0)) return MESSAGES.too_many_requests!;
  const minutes = Math.ceil(seconds / 60);
  return `You have asked for too many codes. You can ask for a new one in ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}. A code you already have still works until it expires.`;
}

const UNREACHABLE = 'Could not reach the tracker. Check your connection and try again.';

export function messageFor(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 429) return tooMany(error);
    // A 5xx without the API's JSON body (code http_5xx) came from the proxy in front of it: the API did not answer.
    if (/^http_5\d\d$/.test(error.code)) return UNREACHABLE;
    return MESSAGES[error.code] ?? (error.status < 500 && error.message ? error.message : 'Something went wrong. Try again, or call the IT support desk.');
  }
  return UNREACHABLE;
}

export function isCode(error: unknown, code: string): boolean {
  return error instanceof ApiError && error.code === code;
}
