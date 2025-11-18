/**
 * PWA Icon Generator Script
 * 
 * This script generates PWA icons from a source image.
 * 
 * Usage:
 *   1. Place your source icon (512x512px or larger) as 'source-icon.png' in this directory
 *   2. Run: node scripts/generate-pwa-icons.js
 *   3. Icons will be generated in public/icons/
 * 
 * Requirements:
 *   - Node.js
 *   - sharp package: npm install sharp
 */

const fs = require('fs');
const path = require('path');

// Icon sizes required for PWA
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function generateIcons() {
  try {
    // Check if sharp is available
    let sharp;
    try {
      sharp = require('sharp');
    } catch (err) {
      console.error('❌ Error: sharp package not found.');
      console.log('📦 Install it with: npm install sharp');
      console.log('   Or use: pnpm add sharp');
      process.exit(1);
    }

    const sourcePath = path.join(__dirname, 'source-icon.png');
    const outputDir = path.join(__dirname, '../public/icons');

    // Check if source icon exists
    if (!fs.existsSync(sourcePath)) {
      console.error('❌ Error: source-icon.png not found in scripts/ directory');
      console.log('📝 Please place your source icon (512x512px or larger) as:');
      console.log(`   ${sourcePath}`);
      process.exit(1);
    }

    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    console.log('🎨 Generating PWA icons...\n');

    // Generate icons
    for (const size of sizes) {
      const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
      
      await sharp(sourcePath)
        .resize(size, size, {
          fit: 'cover',
          position: 'center',
        })
        .png({
          quality: 100,
          compressionLevel: 9,
        })
        .toFile(outputPath);
      
      console.log(`✅ Generated icon-${size}x${size}.png`);
    }

    console.log('\n✨ All icons generated successfully!');
    console.log(`📁 Icons saved to: ${outputDir}`);
    console.log('\n📋 Next steps:');
    console.log('   1. Verify icons in apps/web/public/icons/');
    console.log('   2. Test PWA installation on mobile devices');
    console.log('   3. Update manifest.json if needed');

  } catch (error) {
    console.error('❌ Error generating icons:', error.message);
    process.exit(1);
  }
}

// Run the generator
generateIcons();

