import { defineCloudflareConfig } from '@opennextjs/cloudflare';
// Minimal config. Add an incremental cache (e.g. R2) later if you use ISR heavily — see the OpenNext Cloudflare caching docs.
export default defineCloudflareConfig({});
