import express from 'express';
import { getEvents, createEvent } from '../controllers/eventsController.js';
import { authMiddleware, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET events: available to all authenticated users (read-only)
// POST events: admin-only (create/modify events)
router.get('/', authMiddleware, getEvents);
router.post('/', authMiddleware, adminOnly, createEvent);

export default router;

