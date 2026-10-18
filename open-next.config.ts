import { defineCloudflareConfig } from '@opennextjs/cloudflare';

// buildCommand: 'npx next build'
// Setting buildCommand avoids infinite recursion when package.json "build" runs opennextjs-cloudflare build
const config = defineCloudflareConfig({});
config.buildCommand = 'npx next build';

export default config;


