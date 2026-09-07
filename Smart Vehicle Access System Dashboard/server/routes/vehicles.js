import express from 'express';
import { 
  addVehicleHandler, 
  getVehiclesHandler, 
  getVehicleByIdHandler,
  updateVehicleHandler,
  deleteVehicleHandler 
} from '../controllers/vehicleController.js';
import { authMiddleware, adminOrOwner } from '../middleware/authMiddleware.js';
import multer from 'multer';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for vehicle photo uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only PNG, JPG, WEBP
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PNG, JPG, and WEBP images are allowed'), false);
    }
  },
});

// Middleware to handle vehicle photo upload
const vehiclePhotoUpload = async (req, res, next) => {
  if (!req.file) {
    return next(); // No file, continue without photo
  }

  try {
    // Create uploads/vehicles directory if it doesn't exist
    const vehiclesDir = path.join(__dirname, '..', 'public', 'uploads', 'vehicles');
    try {
      await fs.access(vehiclesDir);
    } catch {
      await fs.mkdir(vehiclesDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const ext = req.file.mimetype === 'image/png' ? 'png' : 
                req.file.mimetype === 'image/webp' ? 'webp' : 'jpg';
    const filename = `vehicle_${timestamp}_${randomStr}.${ext}`;
    const filepath = path.join(vehiclesDir, filename);

    // Process and save image using Sharp
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

    // Attach filename to request for controller
    req.file.filename = filename;
    next();
  } catch (error) {
    console.error('Error processing vehicle photo:', error);
    return res.status(500).json({ error: 'Failed to process vehicle photo' });
  }
};

const router = express.Router();

// POST /api/vehicles/add - Add new vehicle (requires auth, role-based)
router.post('/add', authMiddleware, upload.single('photo'), vehiclePhotoUpload, addVehicleHandler);

// GET /api/vehicles - Get all vehicles (requires auth)
router.get('/', authMiddleware, getVehiclesHandler);

// GET /api/vehicles/:id - Get vehicle by ID (requires auth)
router.get('/:id', authMiddleware, getVehicleByIdHandler);

// PUT /api/vehicles/:id - Update vehicle (requires auth, admin or owner)
router.put('/:id', authMiddleware, adminOrOwner, upload.single('photo'), vehiclePhotoUpload, updateVehicleHandler);

// DELETE /api/vehicles/:id - Delete vehicle (requires auth, admin or owner)
router.delete('/:id', authMiddleware, adminOrOwner, deleteVehicleHandler);

export default router;

