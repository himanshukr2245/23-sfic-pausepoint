// Unit tests for the browser telemetry client (OPS-2): allow-list before buffering, batching, offline waiting, failed hand-off kept.
import { describe, it, expect } from 'vitest';
import { createTelemetry, LOG_ENDPOINT } from './client';

const tick = () => new Promise((r) => setTimeout(r, 0));

function fakeEnv(online = true, accept = true) {
  const sent: { url: string; events: unknown[] }[] = [];
  return { sent, env: { online: () => online, send: (url: string, body: string) => { if (accept) sent.push({ url, events: JSON.parse(body) }); return accept; } } };
}

describe('telemetry client', () => {
  it('drops unknown events and fields before anything is kept', async () => {
    const { sent, env } = fakeEnv();
    const t = createTelemetry(env);
    expect(t.report({ event: 'definitely_not_allowed' })).toBeNull();
    const kept = t.report({ event: 'client_error', code: 'CLIENT_JS_EXCEPTION', email: 'a@b.co', secret: 'x' });
    expect(kept).not.toBeNull();
    expect(kept).not.toHaveProperty('email');
    expect(kept).not.toHaveProperty('secret');
    await tick();
    expect(sent).toHaveLength(1);
    expect(sent[0].url).toBe(LOG_ENDPOINT);
  });

  it('waits while offline and flushes everything when the network returns', async () => {
    let online = false;
    const sent: unknown[][] = [];
    const t = createTelemetry({ online: () => online, send: (_u, body) => { sent.push(JSON.parse(body)); return true; } });
    t.report({ event: 'offline_entered' });
    t.report({ event: 'sync_queued', queueDepth: 3 });
    await tick();
    expect(sent).toHaveLength(0);
    expect(t.size).toBe(2);
    online = true;
    expect(t.flush()).toBe(2);
    expect(t.size).toBe(0);
  });

  it('keeps events the browser refused to hand over', async () => {
    const { env } = fakeEnv(true, false);
    const t = createTelemetry(env);
    t.report({ event: 'app_started' });
    await tick();
    expect(t.size).toBe(1);
  });

  it('sends big backlogs in batches of 20', () => {
    const { sent, env } = fakeEnv(false);
    const t = createTelemetry(env, 100);
    for (let i = 0; i < 45; i++) t.report({ event: 'route_changed' });
    env.online = () => true;
    expect(t.flush()).toBe(45);
    expect(sent.map((s) => s.events.length)).toEqual([20, 20, 5]);
  });
});
