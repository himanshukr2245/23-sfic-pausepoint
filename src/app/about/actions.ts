'use server';
// app/about/actions.ts — the SEC-5 pattern on a Server Action (a public HTTP endpoint): validate → act → respond generically.
// Server Actions get Origin checking from Next.js; they still validate every field and never trust the client.
import * as z from '@/lib/zod';

const Greeting = z.strictObject({
  name: z.string().check(z.trim(), z.minLength(1, 'Please enter your name.'), z.maxLength(60, 'Please keep it under 60 characters.')),
});

export type GreetState = { ok: boolean; message: string; field?: string };

export async function greet(_prev: GreetState, form: FormData): Promise<GreetState> {
  const parsed = Greeting.safeParse({ name: form.get('name') ?? '' });
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, message: issue?.message ?? 'Please check the form.', field: String(issue?.path[0] ?? 'name') };
  }
  return { ok: true, message: `Hello, ${parsed.data.name}. Validated on the server.` };   // React escapes this when rendering
}
