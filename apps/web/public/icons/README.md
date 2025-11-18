# Lab Link PWA Icons

## Status
⚠️ **Icons need to be generated** - Currently using placeholders

## Required Icon Sizes
- 72x72px
- 96x96px
- 128x128px
- 144x144px
- 152x152px
- 192x192px
- 384x384px
- 512x512px

## Quick Start

### Option 1: Use the Generation Script (Recommended)
1. Install sharp: `pnpm add sharp` (or `npm install sharp`)
2. Place your source icon (512x512px or larger) as `source-icon.png` in `apps/web/scripts/`
3. Run: `node apps/web/scripts/generate-pwa-icons.js`
4. Icons will be generated in this directory

### Option 2: Use Online Tools
1. Visit https://www.pwabuilder.com/imageGenerator
2. Upload your 512x512px source icon
3. Download and extract icons to this directory

### Option 3: Manual Creation
Create icons using design tools (Figma, Photoshop, etc.) and export at each required size.

## Icon Design Guidelines
- Square format (1:1 aspect ratio)
- Keep important content within 80% (safe zone for maskable icons)
- Use Lab Link brand colors
- Simple, recognizable design
- High contrast for visibility

## Verification
After generating icons:
1. Verify all 8 icon files exist
2. Test PWA installation on Chrome (Android) and Safari (iOS)
3. Check that icons display correctly in the app

See `generate-icons.md` for detailed instructions.
