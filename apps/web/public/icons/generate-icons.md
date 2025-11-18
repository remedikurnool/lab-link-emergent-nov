# PWA Icon Generation Guide

## Overview
This guide explains how to generate PWA icons for the Lab Link application.

## Required Icon Sizes
The following icon sizes are required for PWA support:
- 72x72px
- 96x96px
- 128x128px
- 144x144px
- 152x152px
- 192x192px
- 384x384px
- 512x512px

## Method 1: Using Online Tools (Recommended)

### Option A: PWA Asset Generator
1. Visit: https://www.pwabuilder.com/imageGenerator
2. Upload your source icon (recommended: 512x512px or larger)
3. Download the generated icon set
4. Extract and place icons in `apps/web/public/icons/` directory

### Option B: RealFaviconGenerator
1. Visit: https://realfavicongenerator.net/
2. Upload your source icon
3. Configure settings:
   - Android Chrome: Enable
   - iOS: Enable
   - Windows Metro: Enable
4. Generate and download
5. Extract icons to `apps/web/public/icons/`

## Method 2: Using ImageMagick (Command Line)

If you have ImageMagick installed:

```bash
# Create a source icon (512x512px) first, then:
convert source-icon.png -resize 72x72 icon-72x72.png
convert source-icon.png -resize 96x96 icon-96x96.png
convert source-icon.png -resize 128x128 icon-128x128.png
convert source-icon.png -resize 144x144 icon-144x144.png
convert source-icon.png -resize 152x152 icon-152x152.png
convert source-icon.png -resize 192x192 icon-192x192.png
convert source-icon.png -resize 384x384 icon-384x384.png
cp source-icon.png icon-512x512.png
```

## Method 3: Using Node.js Script

Create a simple Node.js script using `sharp`:

```javascript
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const sourceIcon = 'source-icon.png'; // Your source icon path
const outputDir = path.join(__dirname, 'apps/web/public/icons');

async function generateIcons() {
  for (const size of sizes) {
    await sharp(sourceIcon)
      .resize(size, size)
      .png()
      .toFile(path.join(outputDir, `icon-${size}x${size}.png`));
    console.log(`Generated icon-${size}x${size}.png`);
  }
}

generateIcons().catch(console.error);
```

## Icon Design Guidelines

### Design Requirements:
1. **Square format**: Icons must be square (1:1 aspect ratio)
2. **Safe zone**: Keep important content within 80% of the icon (for maskable icons)
3. **Simple design**: Icons should be recognizable at small sizes
4. **Brand colors**: Use Lab Link brand colors (primary: #3b82f6, purple: #8B5CF6)

### Recommended Design Elements:
- Medical cross or stethoscope symbol
- "LL" or "Lab Link" text (for larger sizes)
- Clean, modern design
- High contrast for visibility

## Quick Start (Placeholder Icons)

If you need placeholder icons immediately for development:

1. Create a simple colored square with text
2. Use a tool like Figma, Canva, or Photoshop
3. Export at 512x512px
4. Generate all sizes using one of the methods above

## Verification

After generating icons, verify:
1. All icon files exist in `apps/web/public/icons/`
2. Icons are PNG format
3. File names match manifest.json exactly
4. Test PWA installation on:
   - Chrome (Android)
   - Safari (iOS)
   - Edge (Windows)

## Notes

- Icons are referenced in `apps/web/public/manifest.json`
- The manifest is already configured correctly
- Icons will be used when users install the PWA
- Maskable icons work better on Android devices

