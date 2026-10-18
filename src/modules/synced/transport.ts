// modules/synced/transport.ts — how the sync engine talks to the server. The engine only knows this interface (tests use a fake);
// supabaseTransport() is the real one: the person's own session, so RLS limits every read and write to their rows.
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Note } from '@/lib/notes/model';
import type { OutboxEntry } from '@/modules/offline/sync/outbox';

/** A note as the server knows it: tombstones included (deletedAt), and the server's own clock for "changed since" (syncedAt). */
export interface RemoteNote extends Note { deletedAt: string | null; syncedAt: string }

export interface Transport {
  /** Send one change. Resolve ONLY when the server stored it; reject otherwise (the outbox retries with backoff). */
  push(entry: OutboxEntry, row: Note | null): Promise<void>;
  /** Changes stored after `since` (server clock), oldest first, at most `limit`. */
  pull(since: string | null, limit: number): Promise<RemoteNote[]>;
}

type Row = { id: string; body: string; created_at: string; updated_at: string; deleted_at: string | null; synced_at: string };
const iso = (v: string) => new Date(v).toISOString();

export function supabaseTransport(supabase: SupabaseClient, table = 'starter_notes'): Transport {
  return {
    async push(entry, row) {
      if (entry.op === 'upsert' && row) {
        // upsert on the primary key: sending the same change twice is harmless (idempotent). The starter_notes trigger keeps the
        // newer row when an older edit arrives late (last write wins on the server too); deleted_at: null brings a note back only when
        // this edit is newer than the deletion.
        const { error } = await supabase.from(table)
          .upsert({ id: row.id, body: row.body, created_at: row.createdAt, updated_at: row.updatedAt, deleted_at: null }, { onConflict: 'id' });
        if (error) throw new Error(`push ${error.code ?? 'failed'}`);
        return;
      }
      // a delete becomes a tombstone (text wiped), so the person's other devices remove the note on their next pull
      const at = new Date(entry.updatedAt).toISOString();
      const { error } = await supabase.from(table).update({ body: '', deleted_at: at, updated_at: at }).eq('id', entry.rowId);
      if (error) throw new Error(`delete ${error.code ?? 'failed'}`);
    },
    async pull(since, limit) {
      let query = supabase.from(table).select('id, body, created_at, updated_at, deleted_at, synced_at')
        .order('synced_at', { ascending: true }).limit(limit);
      if (since) query = query.gt('synced_at', since);
      const { data, error } = await query;
      if (error) throw new Error(`pull ${error.code ?? 'failed'}`);
      return (data as Row[]).map((r) => ({ id: r.id, body: r.body, createdAt: iso(r.created_at), updatedAt: iso(r.updated_at),
        deletedAt: r.deleted_at ? iso(r.deleted_at) : null, syncedAt: iso(r.synced_at) }));
    },
  };
}

/** The same transport over a client that is still loading (the on-demand browser client): each call waits for it. */
export function lazyTransport(client: Promise<SupabaseClient>, table = 'starter_notes'): Transport {
  return {
    push: async (entry, row) => supabaseTransport(await client, table).push(entry, row),
    pull: async (since, limit) => supabaseTransport(await client, table).pull(since, limit),
  };
}
