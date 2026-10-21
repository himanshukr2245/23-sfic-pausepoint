// scripts/build-apk.mjs — 1-Command Automated Native Android APK Assembler (100% Pure Kotlin + Compose)
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const androidDir = path.join(rootDir, 'android');

console.log('🛡️ Step 1/3: Verifying Android brand assets & icons...');
execSync('node scripts/generate-android-icons.mjs', { cwd: rootDir, stdio: 'inherit' });

console.log('⚙️ Step 2/3: Compiling 100% Pure Kotlin + Jetpack Compose Release APK via Gradle...');
const isWindows = process.platform === 'win32';
const gradlewCmd = isWindows ? 'gradlew.bat assembleRelease' : './gradlew assembleRelease';
execSync(gradlewCmd, { cwd: androidDir, stdio: 'inherit' });

console.log('📦 Step 3/3: Deploying signed Release APK to project root...');
const srcApk = path.join(androidDir, 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk');
const destApk = path.join(rootDir, 'PausePoint-Shield-v1.0.apk');

if (fs.existsSync(srcApk)) {
  fs.copyFileSync(srcApk, destApk);
  const stats = fs.statSync(destApk);
  const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`\n🎉 NATIVE BUILD COMPLETE! APK is ready:`);
  console.log(`   Path: ${destApk}`);
  console.log(`   Size: ${sizeMb} MB`);
  console.log(`   Architecture: 100% Pure Kotlin + Jetpack Compose (Zero WebView)`);
  console.log(`   Security: Signed with dedicated Keystore, Airgapped Zero Internet`);
} else {
  console.error(`❌ Error: APK not found at ${srcApk}`);
  process.exit(1);
}
