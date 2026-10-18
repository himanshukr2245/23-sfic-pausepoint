// modules/auth/forms.ts — the rules for every auth form, checked in the browser before anything is sent (instant, specific messages).
// Supabase Auth checks again on its side; these schemas only make mistakes cheap and clear.
import * as z from '@/lib/zod';

export const Email = z.pipe(
  z.string().check(z.trim(), z.toLowerCase(), z.maxLength(254, 'Please enter a valid email address.')),
  z.email('Please enter a valid email address.'),
);
/** 72: bcrypt ignores anything longer, so a longer password would silently not be what the person typed. */
export const NewPassword = z.string().check(z.minLength(8, 'Use at least 8 characters.'), z.maxLength(72, 'Please keep the password under 72 characters.'));
const AnyPassword = z.string().check(z.minLength(1, 'Please enter your password.'), z.maxLength(72, 'Please keep the password under 72 characters.'));

export const SignInForm = z.object({ email: Email, password: AnyPassword });
export const SignUpForm = z.object({ email: Email, password: NewPassword });
export const ResetForm = z.object({ email: Email });
export const PasswordForm = z.object({ password: NewPassword });
export const DeleteForm = z.object({ confirm: z.string().check(z.trim(), z.toUpperCase(), z.refine((v) => v === 'DELETE', 'Type DELETE to confirm.')) });

/** The email-link types this app sends (see supabase/templates). */
export const OtpType = z.enum(['email', 'signup', 'recovery', 'email_change', 'invite', 'magiclink']);
export const TokenHash = z.string().check(z.regex(/^[\w-]{6,512}$/, 'This link is incomplete.'));

export type FieldError = { ok: false; field: string; message: string };

/** Parse a form; on failure, the first problem and the field it belongs to (for aria-invalid and focus). */
export function check<T>(schema: z.ZodMiniType<T>, values: Record<string, unknown>): { ok: true; data: T } | FieldError {
  const r = schema.safeParse(values);
  if (r.success) return { ok: true, data: r.data };
  const issue = r.error.issues[0];
  return { ok: false, field: String(issue?.path[0] ?? ''), message: issue?.message ?? 'Please check the form.' };
}
