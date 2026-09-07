import express from 'express';
import { getAllUsersHandler, updateAdminAccessHandler } from '../controllers/userManagementController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(authMiddleware);
router.use(adminOnly);

router.get('/', getAllUsersHandler);
router.put('/:id/admin-access', updateAdminAccessHandler);

export default router;

