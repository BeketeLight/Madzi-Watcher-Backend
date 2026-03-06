import express from 'express';
import { authenticateJWT } from '../middleware/authMiddleware.mjs';
import { checkRole } from '../middleware/roleMiddleware.mjs';
import {
  getLatestWaterQuality,
  getWaterQualityHistory,   
  getWaterQualityStats,
  getWaterQualityIndex,
  addWaterQualityData,  
  addWaterQualityDataManual,
  updateWaterQualityData,
  deleteWaterQualityData  
} from '../controllers/waterQualityController.mjs';

const router = express.Router();

// Get water quality data (accessible to all authenticated users)
router.get('/latest', authenticateJWT, getLatestWaterQuality);
router.get('/history', authenticateJWT, getWaterQualityHistory);
router.get('/stats', authenticateJWT, getWaterQualityStats);
router.get('/index', authenticateJWT, getWaterQualityIndex);

// Add water quality data manually (admin and officer only - for testing/fallback)
router.post('/manual', authenticateJWT, checkRole(['admin','superadmin','officer']), addWaterQualityDataManual);  

// Add new water quality data (admin and officer only)
router.post('/', authenticateJWT, checkRole(['admin','superadmin','officer']), addWaterQualityData);
// Update water quality data (admin and officer only)
router.put('/:id', authenticateJWT, checkRole(['admin','superadmin','officer']), updateWaterQualityData);
// Delete water quality data (admin and officer only)
router.delete('/:id', authenticateJWT, checkRole(['admin','superadmin','officer']), deleteWaterQualityData);

export default router;        