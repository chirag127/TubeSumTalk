/**
 * Script to convert extension/icons/icon.svg into icon16.png, icon48.png, and icon128.png
 * Requires: sharp
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const inputSvg = path.resolve(__dirname, '../extension/icons/icon.svg');
const outputDir = path.resolve(__dirname, '../extension/icons');
const sizes = [16, 48, 128];

async function generateIcons() {
  if (!fs.existsSync(inputSvg)) {
    console.error('SVG file not found:', inputSvg);
    process.exit(1);
  }
  for (const size of sizes) {
    const outputPng = path.join(outputDir, `icon${size}.png`);
    try {
      await sharp(inputSvg)
        .resize(size, size)
        .png()
        .toFile(outputPng);
      console.log(`Generated ${outputPng}`);
    } catch (err) {
      console.error(`Failed to generate ${outputPng}:`, err);
      process.exit(1);
    }
  }
  console.log('All icons generated successfully.');
}

generateIcons();