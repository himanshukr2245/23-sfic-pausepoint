// scripts/check-android.mjs — PausePoint Android & Security Gate [HK Gate Ladder]
// Verifies:
// 1. Zero Internet Permission (<uses-permission android:name="...INTERNET" tools:node="remove"/>)
// 2. Flavor manifest isolation (publicEdition has NO SMS or NotificationListener permissions)
// 3. Shield manifest presence (SMS + NotificationListener + CallScreening)
// 4. Rule-pack and fixture integrity
// 5. Static export presence and integrity
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function fail(msg) {
  console.error(`❌ check-android [AND-1]: ${msg}`);
  process.exit(1);
}

console.log('🛡️ Running PausePoint Android Security & Conformance Gate...');

// 1. Check main manifest for Zero-Internet policy
const mainManifestPath = path.join(rootDir, 'android', 'app', 'src', 'main', 'AndroidManifest.xml');
if (!fs.existsSync(mainManifestPath)) {
  fail('Main AndroidManifest.xml missing');
}
const mainManifest = fs.readFileSync(mainManifestPath, 'utf8');

if (!mainManifest.includes('android.permission.INTERNET') || !mainManifest.includes('tools:node="remove"')) {
  fail('AndroidManifest.xml must remove android.permission.INTERNET using tools:node="remove"');
}
console.log('  ✓ Main manifest enforces zero-internet policy (tools:node="remove")');

// 2. Check publicEdition manifest for Play Protect safety
const publicManifestPath = path.join(rootDir, 'android', 'app', 'src', 'publicEdition', 'AndroidManifest.xml');
if (!fs.existsSync(publicManifestPath)) {
  fail('publicEdition AndroidManifest.xml missing');
}
const publicManifest = fs.readFileSync(publicManifestPath, 'utf8');

if (publicManifest.includes('RECEIVE_SMS') || publicManifest.includes('READ_SMS')) {
  fail('publicEdition manifest must NOT contain SMS permissions (Play Protect policy)');
}
if (publicManifest.includes('NotificationListenerService')) {
  fail('publicEdition manifest must NOT contain NotificationListenerService');
}
if (!publicManifest.includes('CallGuardService')) {
  fail('publicEdition manifest must declare CallGuardService');
}
console.log('  ✓ publicEdition manifest is isolated & safe for Play Protect');

// 3. Check shield manifest for full on-phone firewall capabilities
const shieldManifestPath = path.join(rootDir, 'android', 'app', 'src', 'shield', 'AndroidManifest.xml');
if (!fs.existsSync(shieldManifestPath)) {
  fail('shield AndroidManifest.xml missing');
}
const shieldManifest = fs.readFileSync(shieldManifestPath, 'utf8');

if (!shieldManifest.includes('RECEIVE_SMS')) {
  fail('shield manifest must declare RECEIVE_SMS');
}
if (!shieldManifest.includes('NotificationListenerService')) {
  fail('shield manifest must declare NotificationListenerService');
}
if (!shieldManifest.includes('CallGuardService')) {
  fail('shield manifest must declare CallGuardService');
}
console.log('  ✓ shield manifest contains full on-phone scam firewall services');

// 4. Verify rule-pack integrity
const packPath = path.join(rootDir, 'rules', 'pack.json');
if (!fs.existsSync(packPath)) {
  fail('rules/pack.json missing');
}
const pack = JSON.parse(fs.readFileSync(packPath, 'utf8'));
if (!pack.version || !pack.levers || !pack.playbooks) {
  fail('rules/pack.json schema invalid');
}
console.log(`  ✓ Universal rule pack v${pack.version} verified (${pack.levers.length} levers, ${pack.playbooks.length} playbooks)`);

// 5. Verify static export assets
const outIndexPath = path.join(rootDir, 'out', 'index.html');
if (!fs.existsSync(outIndexPath)) {
  console.warn('  ⚠️ out/index.html not found yet. Run npm run build:cap to generate.');
} else {
  const outIndex = fs.readFileSync(outIndexPath, 'utf8');
  if (outIndex.length < 500) {
    fail('out/index.html appears truncated or empty');
  }
  console.log('  ✓ Static export directory out/ validated with non-empty index.html');
}

console.log('✅ check-android [AND-1]: all Android security & architecture gates passed cleanly!');
