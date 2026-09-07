import multer from 'multer';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

export const uploadMiddleware = upload.single('image');

/**
 * POST /api/upload
 * Upload and compress vehicle image
 */
export async function uploadImage(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
    try {
      await fs.access(uploadsDir);
    } catch {
      await fs.mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const filename = `vehicle_${timestamp}_${randomStr}.jpg`;
    const filepath = path.join(uploadsDir, filename);

    // Compress and save image using Sharp
    await sharp(req.file.buffer)
      .resize(800, 600, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({
        quality: 75,
        progressive: true,
      })
      .toFile(filepath);

    // Return the public URL path
    const publicPath = `/uploads/${filename}`;

    res.status(200).json({
      message: 'Image uploaded and compressed successfully',
      image_url: publicPath,
      filename,
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Failed to upload and compress image' });
  }
}

