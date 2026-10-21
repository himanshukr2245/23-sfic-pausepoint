// scripts/phone-run.mjs — 1-Command Direct Deploy & Run to Connected Android Device via ADB
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const androidDir = path.join(rootDir, 'android');

console.log('📱 Checking connected Android devices via ADB...');

let adbOutput = '';
try {
  adbOutput = execSync('adb devices', { encoding: 'utf8' });
} catch {
  console.error('❌ Error: ADB is not found in your system PATH.');
  process.exit(1);
}

const lines = adbOutput.split('\n').map((l) => l.trim()).filter(Boolean);
const devices = lines.slice(1).filter((l) => l.endsWith('device'));

if (devices.length === 0) {
  console.log('\n⚠️  No Android device detected!\n');
  console.log('To deploy directly to your phone in 5 seconds without manual copying:');
  console.log('  1. Connect your Android phone to PC via USB cable.');
  console.log('  2. On your phone: Settings > About Phone > Tap "Build Number" 7 times to enable Developer Options.');
  console.log('  3. In Developer Options: Turn ON "USB Debugging" (and "Install via USB" if on Xiaomi/MIUI).');
  console.log('  4. Tap "Allow" when the RSA authorization prompt appears on your phone screen.');
  console.log('\n  📡 Or use Wireless Debugging (No Cable!):');
  console.log('     adb connect <your-phone-ip>:5555\n');
  console.log('Then run "npm run phone:run" again!');
  process.exit(0);
}

const targetDevice = devices[0].split('\t')[0];
console.log(`✅ Connected device detected: ${targetDevice}`);

const rootApk = path.join(rootDir, 'PausePoint-Shield-v1.0.apk');

function isSrcNewer(dir, targetMtime) {
  if (!fs.existsSync(dir)) return false;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (isSrcNewer(fullPath, targetMtime)) return true;
    } else if (entry.isFile()) {
      const stat = fs.statSync(fullPath);
      if (stat.mtimeMs > targetMtime) return true;
    }
  }
  return false;
}

const apkMtime = fs.existsSync(rootApk) ? fs.statSync(rootApk).mtimeMs : 0;
const srcDir = path.join(androidDir, 'app', 'src');
const hasNewerSource = isSrcNewer(srcDir, apkMtime);
const shouldBuild = process.argv.includes('--build') || !fs.existsSync(rootApk) || hasNewerSource;

try {
  if (shouldBuild) {
    console.log('\n⚙️ Compiling latest Kotlin Compose changes via Gradle...');
    const isWindows = process.platform === 'win32';
    const gradlewCmd = isWindows ? 'gradlew.bat assembleRelease' : './gradlew assembleRelease';
    execSync(gradlewCmd, { cwd: androidDir, stdio: 'inherit' });
    const srcApk = path.join(androidDir, 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk');
    if (fs.existsSync(srcApk)) {
      fs.copyFileSync(srcApk, rootApk);
    }
  }

  console.log('\n📦 Streaming APK directly into phone over ADB...');
  execSync(`adb install -r "${rootApk}"`, { stdio: 'inherit' });

  console.log('\n🚀 Launching PausePoint Shield on phone screen...');
  try {
    execSync('adb shell am force-stop org.pausepoint.shield', { stdio: 'ignore' });
  } catch {}
  execSync('adb shell am start -S -n org.pausepoint.shield/org.pausepoint.app.MainActivity', { stdio: 'inherit' });
  console.log('\n🎉 SUCCESS! PausePoint Shield is now live on your phone!');
} catch (err) {
  console.error('❌ Deployment error:', err.message);
  process.exit(1);
}
