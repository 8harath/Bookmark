/**
 * Icon Generator Script
 *
 * This script generates extension icons in different sizes.
 * Run: node scripts/generate-icons.js
 *
 * For production, you can also use online tools:
 * 1. Go to https://favicon.io/favicon-generator/
 * 2. Upload extension/icons/icon.svg
 * 3. Download and extract to extension/icons/
 *
 * Or use ImageMagick:
 * convert icon.svg -resize 16x16 icon-16.png
 * convert icon.svg -resize 48x48 icon-48.png
 * convert icon.svg -resize 128x128 icon-128.png
 */

const fs = require('fs');
const path = require('path');

console.log('📚 Icon Generation Guide');
console.log('========================\n');
console.log('To generate icons for the extension:\n');
console.log('Option 1 - Online Tool (Easiest):');
console.log('1. Go to https://favicon.io/favicon-generator/');
console.log('2. Text: 📚 (or use emoji)');
console.log('3. Download and extract to extension/icons/\n');
console.log('Option 2 - Use SVG File:');
console.log('1. Use extension/icons/icon.svg');
console.log('2. Convert with ImageMagick or online SVG-to-PNG converter\n');
console.log('Option 3 - Manual Creation:');
console.log('1. Create simple PNG files in any image editor');
console.log('2. Sizes needed: 16x16, 48x48, 128x128');
console.log('3. Save as icon-16.png, icon-48.png, icon-128.png\n');

// Create placeholder text files with instructions
const iconsDir = path.join(__dirname, '../extension/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

const placeholderContent = `This is a placeholder.

Generate actual icons using one of these methods:

1. Online: https://favicon.io/emoji-favicons/ (search for "books" emoji 📚)
2. SVG: Convert icon.svg using online tool or ImageMagick
3. Manual: Create in Figma/Canva/Photoshop

Required sizes:
- icon-16.png (16x16 pixels)
- icon-48.png (48x48 pixels)
- icon-128.png (128x128 pixels)

Design: Black and white bookmark icon with neobrutalism style
`;

['16', '48', '128'].forEach(size => {
  const filename = path.join(iconsDir, `icon-${size}.txt`);
  fs.writeFileSync(filename, placeholderContent);
  console.log(`✓ Created placeholder: icon-${size}.txt`);
});

console.log('\n✅ Run this script completed!');
console.log('⚠️  Remember to replace .txt files with actual .png files before deployment\n');
