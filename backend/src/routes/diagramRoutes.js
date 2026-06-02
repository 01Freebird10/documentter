import express from 'express';
import * as diagramController from '../controllers/diagramController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Enforce session authorization across all diagram visualize endpoints
router.use(protect);

/**
 * @swagger
 * /api/diagrams/{projectId}:
 *   get:
 *     summary: Retrieve UML diagram codes and architectural insights scorecards
 *     description: Parses active project contexts, generating 10 Mermaid syntaxes and insights objects.
 *     tags: [Diagrams]
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
 *         description: UML diagrams list and modular insights scorecard retrieved successfully
 *       404:
 *         description: Project registry not found
 */
router.get('/:projectId', diagramController.getProjectDiagramsAndInsights);

/**
 * @swagger
 * /api/diagrams/svg/{projectId}/{type}:
 *   get:
 *     summary: Stream the vector SVG image file directly
 *     description: Returns clean vector SVG graphics representing system designs, ERDs, sequence diagrams, etc.
 *     tags: [Diagrams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: projectId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: type
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           enum: [system_architecture, component, erd, class_diagram, sequence, use_case, data_flow, api_relationship, module_dependency, user_journey]
 *     responses:
 *       200:
 *         description: Raw vector SVG data streamed successfully
 *       404:
 *         description: Target diagram type not found
 */
router.get('/svg/:projectId/:type', diagramController.streamDiagramSvg);

export default router;
