// scripts/ingest-brand-assets.mjs — Safely copy and optimize brand assets from 00-Assets_Original.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const SOURCE_DIR = path.resolve('..', '00-Assets_Original', '23-sifc-pausepoint');
const BRAND_DIR = path.resolve('public', 'brand');
const ORIGINAL_BACKUP_DIR = path.resolve('public', 'brand', 'original');
const ICONS_DIR = path.resolve('public', 'icons');

async function run() {
  console.log('🛡️  Ingesting brand assets from:', SOURCE_DIR);

  fs.mkdirSync(BRAND_DIR, { recursive: true });
  fs.mkdirSync(ORIGINAL_BACKUP_DIR, { recursive: true });
  fs.mkdirSync(ICONS_DIR, { recursive: true });

  const files = {
    appLogo: path.join(SOURCE_DIR, 'PausePoint_App_logo.png'),
    darkLogo: path.join(SOURCE_DIR, 'PausePoint-Golden_Hour_Defence-Logo-For_Dark_Mode.png'),
    lightLogo: path.join(SOURCE_DIR, 'PausePoint-Golden_Hour_Defence-Logo-For_Light_Mode.png'),
  };

  // 1. Copy originals to public/brand/original (READ-ONLY source, safe project copy)
  for (const srcPath of Object.values(files)) {
    if (!fs.existsSync(srcPath)) {
      throw new Error(`Missing source asset: ${srcPath}`);
    }
    const dest = path.join(ORIGINAL_BACKUP_DIR, path.basename(srcPath));
    fs.copyFileSync(srcPath, dest);
    console.log(`✓ Copied safe backup: ${path.basename(srcPath)}`);
  }

  // 2. Generate web-optimized horizontal logos (width 600px, 2x retina display ready)
  console.log('Generating web-optimized horizontal brandmarks (width 600px)...');
  await sharp(files.darkLogo)
    .resize({ width: 600, withoutEnlargement: true })
    .png({ quality: 90, compressionLevel: 9 })
    .toFile(path.join(BRAND_DIR, 'logo-dark.png'));

  await sharp(files.darkLogo)
    .resize({ width: 600, withoutEnlargement: true })
    .webp({ quality: 90 })
    .toFile(path.join(BRAND_DIR, 'logo-dark.webp'));

  await sharp(files.lightLogo)
    .resize({ width: 600, withoutEnlargement: true })
    .png({ quality: 90, compressionLevel: 9 })
    .toFile(path.join(BRAND_DIR, 'logo-light.png'));

  await sharp(files.lightLogo)
    .resize({ width: 600, withoutEnlargement: true })
    .webp({ quality: 90 })
    .toFile(path.join(BRAND_DIR, 'logo-light.webp'));

  // 3. Generate square app logo variants (256px)
  await sharp(files.appLogo)
    .resize({ width: 256, height: 256, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ quality: 90 })
    .toFile(path.join(BRAND_DIR, 'app-logo.png'));

  await sharp(files.appLogo)
    .resize({ width: 256, height: 256, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 90 })
    .toFile(path.join(BRAND_DIR, 'app-logo.webp'));

  // 4. Generate favicons & PWA launcher icons
  console.log('Generating favicons and PWA launcher icons...');
  await sharp(files.appLogo)
    .resize({ width: 512, height: 512, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(ICONS_DIR, 'icon-512.png'));

  await sharp(files.appLogo)
    .resize({ width: 512, height: 512, fit: 'contain', background: { r: 15, g: 23, b: 42, alpha: 1 } })
    .png()
    .toFile(path.join(ICONS_DIR, 'maskable-512.png'));

  await sharp(files.appLogo)
    .resize({ width: 192, height: 192, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(ICONS_DIR, 'icon-192.png'));

  await sharp(files.appLogo)
    .resize({ width: 180, height: 180, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.resolve('public', 'apple-touch-icon.png'));

  await sharp(files.appLogo)
    .resize({ width: 32, height: 32, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.resolve('public', 'favicon.png'));

  // Copy favicon.png as favicon.ico (modern browsers accept 32x32 PNG favicons)
  fs.copyFileSync(path.resolve('public', 'favicon.png'), path.resolve('public', 'favicon.ico'));

  console.log('✅ Brand asset ingestion and multi-format generation complete!');
}

run().catch((err) => {
  console.error('❌ Failed to ingest brand assets:', err);
  process.exit(1);
});
