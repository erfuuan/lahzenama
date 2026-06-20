import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// Check if sharp is available
let sharp;
try {
  sharp = (await import('sharp')).default;
} catch {
  console.log('sharp not found, trying to install...');
  execSync('npm install sharp --save-dev', { cwd: root, stdio: 'inherit' });
  sharp = (await import('sharp')).default;
}

const svgBuffer = readFileSync(join(root, 'public/icon.svg'));

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
for (const size of sizes) {
  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(join(root, `public/icons/icon-${size}x${size}.png`));
  console.log(`Generated ${size}x${size}`);
}

// apple-touch-icon (180x180)
await sharp(svgBuffer)
  .resize(180, 180)
  .png()
  .toFile(join(root, 'public/apple-touch-icon.png'));
console.log('Generated apple-touch-icon.png');

// favicon
await sharp(svgBuffer)
  .resize(32, 32)
  .png()
  .toFile(join(root, 'public/favicon-32x32.png'));

await sharp(svgBuffer)
  .resize(16, 16)
  .png()
  .toFile(join(root, 'public/favicon-16x16.png'));

console.log('All icons generated!');
