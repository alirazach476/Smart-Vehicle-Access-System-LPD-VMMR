import express from 'express';
import { uploadImage, uploadMiddleware } from '../controllers/uploadController.js';
import { authMiddleware, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Upload routes require admin access
// Order: auth -> admin check -> multer -> upload handler
router.post('/', authMiddleware, adminOnly, uploadMiddleware, uploadImage);

export default router;

