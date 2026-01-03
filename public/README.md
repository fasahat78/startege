# Public Assets Folder

This folder contains static assets that are served directly by Next.js.

## Logo Files

Place your logo files here:

- **`logo.svg`** (recommended) - SVG format for best quality and scalability
- **`logo.png`** (fallback) - PNG format as a fallback if SVG is not available

### Supported Locations:
- `/logo.svg` or `/logo.png` (root of public folder) ✅ **Recommended**
- `/images/logo.svg` or `/images/logo.png` (in images subfolder)

The logo component will automatically try SVG first, then fall back to PNG if SVG is not found.

## Favicon

For favicon support, you can also add:
- `favicon.ico` - Traditional favicon
- `favicon.svg` - Modern SVG favicon
- `apple-touch-icon.png` - Apple touch icon (180x180px)

These will be automatically picked up by the browser and the metadata configuration.

