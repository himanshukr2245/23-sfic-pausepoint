import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import manifest from '../src/app/manifest.ts';
import {
  SHARE_CACHE,
  SHARED_IMAGE_KEY,
  SHARED_TEXT_KEY,
  consumeSharedPayload,
} from '../src/lib/share-target.ts';

// Mock Response for Node environment
class MockResponse {
  private bodyData: unknown;
  public headers: Map<string, string>;

  constructor(bodyData: unknown, init?: { headers?: Record<string, string> }) {
    this.bodyData = bodyData;
    this.headers = new Map(Object.entries(init?.headers ?? {}));
  }

  async blob(): Promise<{ size: number; type: string }> {
    return { size: 1024, type: this.headers.get('content-type') || 'image/png' };
  }

  async text(): Promise<string> {
    return String(this.bodyData);
  }
}

// Mock Cache implementation
class MockCache {
  public store = new Map<string, MockResponse>();

  async match(key: string): Promise<MockResponse | undefined> {
    return this.store.get(key);
  }

  async put(key: string, res: MockResponse): Promise<void> {
    this.store.set(key, res);
  }

  async delete(key: string): Promise<boolean> {
    return this.store.delete(key);
  }
}

describe('Phase D: Android Native PWA Share Target & Offline Ingestion', () => {
  let mockCache: MockCache;

  beforeEach(() => {
    mockCache = new MockCache();
    globalThis.window = {
      caches: {
        open: async (name: string) => {
          assert.equal(name, SHARE_CACHE);
          return mockCache;
        },
      },
      File: class MockFile {
        name: string;
        type: string;
        constructor(parts: unknown[], name: string, options?: { type?: string }) {
          this.name = name;
          this.type = options?.type ?? 'image/png';
        }
      },
    } as unknown as Window & typeof globalThis;
  });

  test('PWA webmanifest defines standard Android W3C Web Share Target Level 2', () => {
    const m = manifest();
    assert.ok(m.share_target, 'Missing share_target in manifest');
    assert.equal(m.share_target.action, '/share-target');
    assert.equal(m.share_target.method, 'POST');
    assert.equal(m.share_target.enctype, 'multipart/form-data');
    assert.ok(m.share_target.params.files, 'Missing files param in share_target');
  });

  test('consumeSharedPayload returns empty when cache has no shared items', async () => {
    const result = await consumeSharedPayload();
    assert.equal(result.file, null);
    assert.equal(result.text, null);
  });

  test('consumes shared receipt image and deletes it from cache to prevent replay', async () => {
    const mockFilePayload = new MockResponse('binary_image_data', {
      headers: {
        'content-type': 'image/jpeg',
        'x-shared-name': encodeURIComponent('gpay_receipt_18oct.jpg'),
      },
    });

    await mockCache.put(SHARED_IMAGE_KEY, mockFilePayload);

    const result = await consumeSharedPayload();
    assert.ok(result.file !== null);
    assert.equal(result.file.name, 'gpay_receipt_18oct.jpg');
    assert.equal(result.file.type, 'image/jpeg');

    // Verifies cache entry was deleted after consumption
    const recheck = await mockCache.match(SHARED_IMAGE_KEY);
    assert.equal(recheck, undefined);
  });

  test('consumes shared bank SMS text payload and deletes it from cache', async () => {
    const sampleSms = 'A/C X7788 debited by 15000.0 on 18Oct26 trf to RAHUL SHARMA Ref 429812345678';
    const mockTextPayload = new MockResponse(sampleSms, {
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    });

    await mockCache.put(SHARED_TEXT_KEY, mockTextPayload);

    const result = await consumeSharedPayload();
    assert.equal(result.text, sampleSms);

    // Verifies cache entry was deleted after consumption
    const recheck = await mockCache.match(SHARED_TEXT_KEY);
    assert.equal(recheck, undefined);
  });
});
