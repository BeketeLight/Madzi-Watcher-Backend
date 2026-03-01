import express from 'express';
import { authenticateJWT } from '../middleware/authMiddleware.mjs';
import { checkRole } from '../middleware/roleMiddleware.mjs';
import {
  getWaterQualityData,
  addWaterQualityData,
  updateWaterQualityData,
  deleteWaterQualityData
} from '../controllers/waterQualityController.mjs';

const router = express.Router();

// Get water quality data (accessible to all authenticated users)
router.get('/', authenticateJWT, getWaterQualityData);

// Add new water quality data (admin and officer only)
router.post('/', authenticateJWT, checkRole(['admin','superadmin','officer']), addWaterQualityData);
// Update water quality data (admin and officer only)
router.put('/:id', authenticateJWT, checkRole(['admin','superadmin','officer']), updateWaterQualityData);
// Delete water quality data (admin and officer only)
router.delete('/:id', authenticateJWT, checkRole(['admin','superadmin','officer']), deleteWaterQualityData);

export default router;        