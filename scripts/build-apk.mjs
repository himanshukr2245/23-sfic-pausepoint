// scripts/build-apk.mjs — 1-Command Automated Android APK Assembler
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const androidDir = path.join(rootDir, 'android');

console.log('🛡️ Step 1/4: Building static web assets (Next.js output: export)...');
execSync('node scripts/build-cap.mjs', { cwd: rootDir, stdio: 'inherit' });

console.log('🔄 Step 2/4: Syncing web assets to native Android platform...');
execSync('npx cap sync android', { cwd: rootDir, stdio: 'inherit' });

console.log('⚙️ Step 3/4: Compiling Shield Edition Android APK via Gradle...');
const isWindows = process.platform === 'win32';
const gradlewCmd = isWindows ? 'gradlew.bat assembleShieldDebug' : './gradlew assembleShieldDebug';
execSync(gradlewCmd, { cwd: androidDir, stdio: 'inherit' });

console.log('📦 Step 4/4: Deploying APK to project root...');
const srcApk = path.join(androidDir, 'app', 'build', 'outputs', 'apk', 'shield', 'debug', 'app-shield-debug.apk');
const destApk = path.join(rootDir, 'PausePoint-Shield-v1.0-debug.apk');

if (fs.existsSync(srcApk)) {
  fs.copyFileSync(srcApk, destApk);
  const stats = fs.statSync(destApk);
  const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`\n🎉 BUILD COMPLETE! APK is ready:`);
  console.log(`   Path: ${destApk}`);
  console.log(`   Size: ${sizeMb} MB`);
} else {
  console.error(`❌ Error: APK not found at ${srcApk}`);
  process.exit(1);
}
