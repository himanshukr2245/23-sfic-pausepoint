import { describe, it, expect } from 'vitest';
import { safeNext, DEFAULT_NEXT } from './next-path';
import { authMessage, NETWORK_MESSAGE, GENERIC_MESSAGE } from './errors';
import { check, SignInForm, SignUpForm, DeleteForm, OtpType, TokenHash } from './forms';

describe('safeNext — no open redirects', () => {
  it('keeps paths on this site, with their query and hash', () => {
    expect(safeNext('/notes')).toBe('/notes');
    expect(safeNext('/account?tab=password#top')).toBe('/account?tab=password#top');
  });
  it.each([
    ['//evil.example'], ['/\\evil.example'], ['https://evil.example'], ['javascript:alert(1)'], ['evil.example'],
    ['/\r\nSet-Cookie: x=1'], ['/a\\b'], [''], ['   '], [42], [null], [undefined], ['/' + 'a'.repeat(600)],
    ['/auth/confirm?token_hash=x'],
  ])('falls back for %j', (value) => {
    expect(safeNext(value)).toBe(DEFAULT_NEXT);
  });
  it('uses the given fallback', () => expect(safeNext('//x', '/')).toBe('/'));
});

describe('authMessage', () => {
  it('never says which of email or password was wrong', () => {
    expect(authMessage({ code: 'invalid_credentials' })).toMatch(/email and password do not match/);
  });
  it('maps known codes, network failures and rate limits', () => {
    expect(authMessage({ code: 'otp_expired' })).toMatch(/expired or was already used/);
    expect(authMessage({ name: 'AuthRetryableFetchError', status: 0 })).toBe(NETWORK_MESSAGE);
    expect(authMessage({ message: 'TypeError: fetch failed' })).toBe(NETWORK_MESSAGE);
    expect(authMessage({ status: 429 })).toMatch(/Too many attempts/);
  });
  it('falls back without leaking the raw message', () => {
    expect(authMessage({ code: 'unexpected_failure', message: 'pg: relation "auth.users" does not exist' })).toBe(GENERIC_MESSAGE);
    expect(authMessage(null, 'custom')).toBe('custom');
  });
});

describe('auth forms', () => {
  it('normalises the email and names the field that is wrong', () => {
    expect(check(SignInForm, { email: '  Asha@Example.COM ', password: 'x' })).toEqual({ ok: true, data: { email: 'asha@example.com', password: 'x' } });
    expect(check(SignInForm, { email: 'asha', password: 'x' })).toEqual({ ok: false, field: 'email', message: 'Please enter a valid email address.' });
    expect(check(SignInForm, { email: 'a@b.co', password: '' })).toMatchObject({ ok: false, field: 'password' });
  });
  it('new passwords: 8 to 72 characters', () => {
    expect(check(SignUpForm, { email: 'a@b.co', password: 'short' })).toMatchObject({ ok: false, field: 'password', message: 'Use at least 8 characters.' });
    expect(check(SignUpForm, { email: 'a@b.co', password: 'x'.repeat(73) })).toMatchObject({ ok: false, field: 'password' });
    expect(check(SignUpForm, { email: 'a@b.co', password: 'long enough' }).ok).toBe(true);
  });
  it('deleting an account needs the word DELETE', () => {
    expect(check(DeleteForm, { confirm: ' delete ' }).ok).toBe(true);
    expect(check(DeleteForm, { confirm: 'yes' })).toMatchObject({ ok: false, message: 'Type DELETE to confirm.' });
  });
  it('email links: only known types and well-formed token hashes', () => {
    expect(OtpType.safeParse('recovery').success).toBe(true);
    expect(OtpType.safeParse('sms').success).toBe(false);
    expect(TokenHash.safeParse('pkce_0123abcdef').success).toBe(true);
    expect(TokenHash.safeParse('abc<script>').success).toBe(false);
  });
});
