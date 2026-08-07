import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const INPUT_DIR = 'src/assets/img';
const OUTPUT_DIR = 'public/optimized';

const MAX_WIDTH = 2400;
const QUALITY = 86;

const supportedExtensions = ['.jpg', '.jpeg', '.png'];

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

async function optimizeImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  if (!supportedExtensions.includes(ext)) return;

  const relativePath = path.relative(INPUT_DIR, filePath);
  const parsed = path.parse(relativePath);

  const outputPath = path.join(
    OUTPUT_DIR,
    parsed.dir,
    `${parsed.name}.webp`
  );

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  const metadata = await sharp(filePath).metadata();

  let pipeline = sharp(filePath);

  if (metadata.width && metadata.width > MAX_WIDTH) {
    pipeline = pipeline.resize({
      width: MAX_WIDTH,
      withoutEnlargement: true
    });
  }

  await pipeline
    .webp({
      quality: QUALITY,
      effort: 5
    })
    .toFile(outputPath);

  const originalSize = fs.statSync(filePath).size;
  const optimizedSize = fs.statSync(outputPath).size;

  const originalMB = (originalSize / 1024 / 1024).toFixed(2);
  const optimizedKB = Math.round(optimizedSize / 1024);

  const reduction = Math.round(
    (1 - optimizedSize / originalSize) * 100
  );

  console.log(
    `✓ ${relativePath} — ${originalMB} MB → ${optimizedKB} KB (${reduction}% smaller)`
  );
}

async function main() {
  console.log('\nOptimizing images...\n');

  if (!fs.existsSync(INPUT_DIR)) {
    console.error(`Input folder not found: ${INPUT_DIR}`);
    process.exit(1);
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const files = walk(INPUT_DIR);

  for (const file of files) {
    await optimizeImage(file);
  }

  console.log('\n✓ Image optimization complete.\n');
}

main().catch((error) => {
  console.error('\nImage optimization failed:\n');
  console.error(error);
  process.exit(1);
});