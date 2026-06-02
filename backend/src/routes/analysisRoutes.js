import express from 'express';
import * as analysisController from '../controllers/analysisController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply session protection globally to all analysis routes
router.use(protect);

/**
 * @swagger
 * /api/analysis/history:
 *   get:
 *     summary: Retrieve aggregate compilations history overview
 *     description: Lists past project scans statuses and percentage accomplishments.
 *     tags: [Analysis]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analysis history successfully fetched
 */
router.get('/history', analysisController.getHistory);

/**
 * @swagger
 * /api/analysis/{projectId}:
 *   get:
 *     summary: Fetch active project compilation status and terminal logs
 *     description: Retrieves real-time dynamic compiler percentages, stage names, and sequential AST parse logs.
 *     tags: [Analysis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: projectId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Active compilation metrics loaded successfully
 *       404:
 *         description: Project or analysis ledger not found
 */
router.get('/:projectId', analysisController.getAnalysis);

export default router;
