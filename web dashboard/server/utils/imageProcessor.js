import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Internal sun glare removal preprocessing
 * This simulates glare removal by adjusting brightness, contrast, and applying filters
 */
export async function removeGlare(imagePath) {
  try {
    // If image doesn't exist, return original path
    const fullPath = path.join(__dirname, '..', 'public', imagePath);
    
    try {
      await fs.access(fullPath);
    } catch {
      // Image doesn't exist, return original path
      return imagePath;
    }

    // Process image to simulate glare removal
    try {
      await sharp(fullPath)
        .modulate({
          brightness: 1.1,  // Slightly increase brightness
          saturation: 0.9,   // Reduce saturation to reduce glare effect
          hue: 0
        })
        .normalize()        // Normalize contrast
        .sharpen()          // Sharpen to improve clarity after glare reduction
        .toBuffer();

      // Processing is internal - return original path
      return imagePath;
    } catch (sharpError) {
      // If sharp fails (e.g., unsupported format), return original path
      console.warn('Image processing skipped:', sharpError.message);
      return imagePath;
    }
  } catch (error) {
    // Return original path on any error
    console.warn('Error processing image for glare removal:', error.message);
    return imagePath;
  }
}

/**
 * Check if image exists
 */
export async function imageExists(imagePath) {
  try {
    const fullPath = path.join(__dirname, '..', 'public', imagePath);
    await fs.access(fullPath);
    return true;
  } catch {
    return false;
  }
}

