import express from 'express';
import { predictVehicle } from '../controllers/predictController.js';

const router = express.Router();

router.post('/', predictVehicle);

export default router;

