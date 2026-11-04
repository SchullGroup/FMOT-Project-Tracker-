import { ApiError, OfflineError } from '@/lib/api';
import { en } from './en';
import { errorText } from './index';

// Every code the sign-in, invite and PIN routes can return (apps/api/src/auth, the step-up guard and the engine).
const AUTH_CODES = [
  'phone_invalid',
  'code_incorrect',
  'code_expired',
  'pin_incorrect',
  'pin_too_easy',
  'pin_not_set',
  'account_locked',
  'device_unknown',
  'device_not_bound',
  'invite_expired',
  'invite_used',
  'pin_confirmation_required',
  'pin_confirmation_used',
  'unauthorized',
  'validation_failed',
  'too_many_requests',
];

describe('errorText', () => {
  it.each(AUTH_CODES)('has its own line for %s', (code) => {
    const text = errorText(en, new ApiError(400, code, 'the API message'));
    expect(text).toBe((en.errors as Record<string, string>)[code]);
    expect(text).not.toBe(en.errors.generic);
  });

  it('says the tracker cannot be reached when nothing answers, or only a proxy does', () => {
    expect(errorText(en, new OfflineError())).toBe(en.errors.offline);
    expect(errorText(en, new ApiError(502, 'http_502', 'Bad Gateway'))).toBe(en.errors.offline);
    expect(errorText(en, new ApiError(500, 'http_500', 'Internal Server Error'))).toBe(en.errors.offline);
  });

  it('keeps the generic line for the API’s own server error', () => {
    expect(errorText(en, new ApiError(500, 'internal_error', 'Something went wrong on our side.'))).toBe(en.errors.generic);
  });
});
