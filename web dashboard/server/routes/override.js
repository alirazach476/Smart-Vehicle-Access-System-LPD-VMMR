import express from 'express';
import { createOverride } from '../controllers/overrideController.js';
import { authMiddleware, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Override routes require admin access
router.post('/', authMiddleware, adminOnly, createOverride);

export default router;

