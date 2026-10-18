// modules/auth/errors.ts — Supabase Auth errors → words a person can act on (LAW-10). Never show raw error text.
// Enumeration-safe on purpose: sign-in never says WHICH of email/password was wrong, and reset/sign-up answer the same either way.
type AuthErrorLike = { code?: string; name?: string; status?: number; message?: string } | null | undefined;

const WORDS: Record<string, string> = {
  invalid_credentials: 'That email and password do not match. Check them, or reset your password.',
  email_not_confirmed: 'Please confirm your email first — open the link we sent you, then sign in.',
  weak_password: 'Please choose a stronger password: at least 8 characters, and not a common one.',
  same_password: 'The new password must be different from your current one.',
  over_email_send_rate_limit: 'Too many emails were sent just now. Please wait a few minutes and try again.',
  over_request_rate_limit: 'Too many attempts. Please wait a minute and try again.',
  otp_expired: 'This link has expired or was already used. Ask for a new one.',
  signup_disabled: 'New accounts cannot be created right now.',
  email_address_invalid: 'Please enter a valid email address.',
  email_address_not_authorized: 'Emails cannot be sent to this address yet.',
  session_not_found: 'Your session has ended. Please sign in again.',
  session_expired: 'Your session has ended. Please sign in again.',
  refresh_token_not_found: 'Your session has ended. Please sign in again.',
  refresh_token_already_used: 'Your session has ended. Please sign in again.',
  reauthentication_needed: 'For your safety, please sign in again before changing this.',
  captcha_failed: 'The safety check failed. Please try again.',
  request_timeout: 'The sign-in service took too long to answer. Please try again.',
};

export const NETWORK_MESSAGE = 'Could not reach the sign-in service. Check your connection and try again.';
export const GENERIC_MESSAGE = 'Something went wrong. Please try again.';

export function authMessage(error: AuthErrorLike, fallback: string = GENERIC_MESSAGE): string {
  if (!error) return fallback;
  if (error.code && WORDS[error.code]) return WORDS[error.code];
  if (error.name === 'AuthRetryableFetchError' || error.status === 0 || /fetch failed|failed to fetch|network/i.test(error.message ?? '')) return NETWORK_MESSAGE;
  if (error.status === 429) return WORDS.over_request_rate_limit;
  return fallback;
}
