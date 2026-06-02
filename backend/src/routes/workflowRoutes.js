import express from 'express';
import * as workflowController from '../controllers/workflowController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Enforce session authorization globally across all workflow endpoints
router.use(protect);

/**
 * @swagger
 * /api/workflow/start:
 *   post:
 *     summary: Start the 9-stage automated orchestration pipeline
 *     description: Enqueues and spawns the background workflow triggers.
 *     tags: [Workflow]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - projectId
 *             properties:
 *               projectId:
 *                 type: string
 *     responses:
 *       210:
 *         description: Pipeline successfully enqueued and started
 */
router.post('/start', workflowController.startWorkflowRun);

/**
 * @swagger
 * /api/workflow/status/{id}:
 *   get:
 *     summary: Retrieve real-time progress of a running pipeline
 *     tags: [Workflow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pipeline step checklists and duration logs retrieved successfully
 */
router.get('/status/:id', workflowController.getWorkflowStatus);

/**
 * @swagger
 * /api/workflow/history:
 *   get:
 *     summary: Retrieve list history of all project workflow runs
 *     tags: [Workflow]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Historically enqueued pipelines fetched successfully
 */
router.get('/history', workflowController.getWorkflowHistory);

/**
 * @swagger
 * /api/workflow/results/{id}:
 *   get:
 *     summary: Fetch finished generated assets URLs and files
 *     tags: [Workflow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Export-ready Word, PDF, and PPTX download links returned
 */
router.get('/results/:id', workflowController.getWorkflowResults);

/**
 * @swagger
 * /api/workflow/retry/{id}:
 *   post:
 *     summary: Reload and resume failed pipelines from failed checkpoints
 *     tags: [Workflow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pipeline successfully reloaded and resumed
 */
router.post('/retry/:id', workflowController.retryWorkflowRun);

export default router;
